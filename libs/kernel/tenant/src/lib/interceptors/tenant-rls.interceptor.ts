import { CallHandler, ExecutionContext, ForbiddenException, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { EntityManager, RequestContext } from '@mikro-orm/core';
import { Observable, from, lastValueFrom } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { getTenantContext } from '@virteex/kernel-tenant-context';
import { TenantService } from '../tenant.service';
import { TenantControlRecord } from '../entities/tenant-control-record.entity';
import { TenantMode, TenantStatus } from '../interfaces/tenant-config.interface';
import { Counter, Histogram } from '@opentelemetry/api';
import { metrics } from '@opentelemetry/api';
import { ResidencyComplianceService } from '../residency-compliance.service';

@Injectable()
export class TenantRlsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TenantRlsInterceptor.name);
  private readonly meter = metrics.getMeter('virteex-tenant-meter');

  private readonly requestCounter: Counter;
  private readonly latencyHistogram: Histogram;
  private readonly errorCounter: Counter;

  constructor(
    private readonly em: EntityManager,
    private readonly tenantService: TenantService,
    private readonly residencyComplianceService: ResidencyComplianceService
  ) {
    this.requestCounter = this.meter.createCounter('tenant_requests_total', {
      description: 'Total number of requests per tenant',
    });
    this.latencyHistogram = this.meter.createHistogram('tenant_request_duration_ms', {
      description: 'Latency of requests per tenant',
      unit: 'ms',
    });
    this.errorCounter = this.meter.createCounter('tenant_errors_total', {
      description: 'Total number of errors per tenant',
    });
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const startTime = performance.now();
    const tenantContext = getTenantContext();

    if (!tenantContext) {
      this.logger.warn('Access attempt without tenant context');
      throw new ForbiddenException('Tenant context is required for all operations');
    }

    // Level 5: Fail-closed contract checks (signature + expiry validated at ingress).
    if (!tenantContext.contextVersion || !tenantContext.exp) {
      this.logger.error(`[SECURITY CRITICAL] Missing canonical tenant claims for ${tenantContext.tenantId}`);
      throw new ForbiddenException('Tenant context integrity cannot be verified');
    }

    const nowEpochSeconds = Math.floor(Date.now() / 1000);
    if (tenantContext.exp <= nowEpochSeconds) {
      this.logger.error(`[SECURITY] Expired tenant context for ${tenantContext.tenantId}`);
      throw new ForbiddenException('Tenant context expired');
    }

    const tenantId = tenantContext.tenantId;
    this.requestCounter.add(1, { tenantId });

    const config = await this.tenantService.getTenantConfig(tenantId);
    if (!config) {
        this.logger.error(`[SECURITY] Configuration missing for tenant ${tenantId}`);
        throw new ForbiddenException('Tenant is currently unavailable');
    }

    // Centralized Data Sovereignty & Regional Residency Enforcement
    await this.enforceRegionalResidency(tenantId, config);

    // Tenant Status Enforcement
    const control = await this.em.findOne(TenantControlRecord, { tenantId });
    if (!control) {
        this.logger.error(`[SECURITY] Control record missing for tenant ${tenantId}`);
        throw new ForbiddenException('Tenant is currently unavailable');
    }

    if (control.status !== TenantStatus.ACTIVE && control.status !== TenantStatus.DEGRADED) {
        this.logger.warn(`Access attempt for tenant ${tenantId} in non-active state: ${control.status}`);
        throw new ForbiddenException(`Tenant is ${control.status.toLowerCase()}. Access denied.`);
    }

    // Write-Freezing Enforcement (Fail-closed)
    if (this.isWriteOperation(context)) {
        if (control?.isFrozen) {
            this.logger.error(`[SECURITY] Write attempt blocked for frozen tenant ${tenantId}`);
            throw new ForbiddenException(`Tenant is currently frozen due to maintenance or failover. Writes are disabled.`);
        }

        if (control?.writeFenceToken) {
            const request = context.switchToHttp().getRequest();
            const writeFence = request?.headers?.['x-write-fence-token'];
            if (!writeFence || writeFence !== control.writeFenceToken) {
              throw new ForbiddenException('Write fencing token validation failed');
            }
        }
    }

    if (config.mode === TenantMode.SHARED) {
      return from(
        this.em.transactional(async (txEm) => {
          // ENSURE RLS is active at session level
          try {
              await txEm.getConnection().execute('SET LOCAL app.current_tenant = ?', [tenantId]);
              await txEm.getConnection().execute('SET LOCAL app.tenant_enforced = ?', ['true']);
          } catch (err: any) {
              this.logger.error(`Failed to set RLS session context for tenant ${tenantId}: ${err.message}`);
              throw new ForbiddenException('Could not establish secure tenant context');
          }

          txEm.setFilterParams('tenant', { tenantId });

          return await RequestContext.create(txEm, async () => {
             try {
                const result = await lastValueFrom(next.handle(), { defaultValue: undefined });
                this.recordMetrics(tenantId, startTime);
                return result;
             } catch (error) {
                this.recordError(tenantId, error);
                throw error;
             }
          });
        })
      );
    } else if (config.mode === TenantMode.DATABASE) {
        // For DB-per-tenant, we ensure we use a dedicated EM fork
        const tenantEm = (this.em as any).fork({ connectionString: config.connectionString });
        return from(
            RequestContext.create(tenantEm, async () => {
                try {
                    const result = await lastValueFrom(next.handle(), { defaultValue: undefined });
                    this.recordMetrics(tenantId, startTime);
                    return result;
                } catch (error) {
                    this.recordError(tenantId, error);
                    throw error;
                }
            })
        );
    }

    return next.handle().pipe(
        tap(() => this.recordMetrics(tenantId, startTime)),
        catchError((error) => {
            this.recordError(tenantId, error);
            throw error;
        })
    );
  }

  private recordMetrics(tenantId: string, startTime: number) {
    const duration = performance.now() - startTime;
    this.latencyHistogram.record(duration, { tenantId });
    this.logger.log(`Tenant ${tenantId} operation completed in ${duration.toFixed(2)}ms`);
  }

  private recordError(tenantId: string, error: any) {
    this.errorCounter.add(1, { tenantId, status: error.status || 500 });
    this.logger.error(`Tenant ${tenantId} operation failed: ${error.message}`);
  }

  private isWriteOperation(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const method = request?.method;
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  }

  private async enforceRegionalResidency(tenantId: string, _config: any): Promise<void> {
    const currentRegion = process.env['AWS_REGION'];

    if (!currentRegion && process.env['NODE_ENV'] === 'production') {
        this.logger.error('[SECURITY CRITICAL] AWS_REGION is not defined in production');
        throw new Error('Regional context missing');
    }

    const effectiveCurrentRegion = currentRegion || 'us-east-1';
    await this.residencyComplianceService.assertRegionAllowed(tenantId, effectiveCurrentRegion, 'database', 'sync');
  }
}
