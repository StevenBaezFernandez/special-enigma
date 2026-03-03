import { CallHandler, ExecutionContext, ForbiddenException, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { EntityManager, RequestContext } from '@mikro-orm/core';
import { Observable, from, lastValueFrom } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { getTenantContext } from '@virteex/kernel-auth';
import { TenantService } from '../tenant.service';
import { TenantControlRecord } from '../entities/tenant-control-record.entity';
import { TenantMode } from '../interfaces/tenant-config.interface';
import { Counter, Histogram } from '@opentelemetry/api';
import { metrics } from '@opentelemetry/api';

@Injectable()
export class TenantRlsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TenantRlsInterceptor.name);
  private readonly meter = metrics.getMeter('virteex-tenant-meter');

  private readonly requestCounter: Counter;
  private readonly latencyHistogram: Histogram;
  private readonly errorCounter: Counter;

  constructor(
    private readonly em: EntityManager,
    private readonly tenantService: TenantService
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

    const tenantId = tenantContext.tenantId;
    this.requestCounter.add(1, { tenantId });

    const config = await this.tenantService.getTenantConfig(tenantId);

    // Centralized Data Sovereignty & Regional Residency Enforcement
    await this.enforceRegionalResidency(tenantId, config);

    // Write-Freezing Enforcement (Fail-closed)
    if (this.isWriteOperation(context)) {
        const control = await this.em.findOne(TenantControlRecord, { tenantId });
        if (control?.isFrozen) {
            this.logger.error(`[SECURITY] Write attempt blocked for frozen tenant ${tenantId}`);
            throw new ForbiddenException(`Tenant is currently frozen due to maintenance or failover. Writes are disabled.`);
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

  private async enforceRegionalResidency(tenantId: string, config: any): Promise<void> {
    const currentRegion = process.env['AWS_REGION'] || 'us-east-1'; // fallback only for dev
    const allowedRegion = config.settings?.['allowedRegion'] || config.primaryRegion;

    if (!allowedRegion) {
        this.logger.warn(`No residency policy defined for tenant ${tenantId}. Defaulting to fail-closed.`);
        throw new ForbiddenException('Data residency policy not established for this tenant.');
    }

    if (allowedRegion !== currentRegion) {
        // Critical Violation: Fail-closed
        this.logger.error(`[SECURITY] Data Sovereignty Violation: Tenant ${tenantId} is restricted to ${allowedRegion} but request reached ${currentRegion}`);
        this.errorCounter.add(1, { tenantId, type: 'sovereignty_violation' });

        // Audit log entry for compliance
        this.logger.warn(`AUDIT: Region Bypass Attempted: Tenant=${tenantId}, Expected=${allowedRegion}, Actual=${currentRegion}`);

        throw new ForbiddenException(`Data residency policy violation. Access denied for region: ${currentRegion}`);
    }
  }
}
