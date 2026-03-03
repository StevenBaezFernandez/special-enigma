import { CallHandler, ExecutionContext, ForbiddenException, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { EntityManager, RequestContext } from '@mikro-orm/core';
import { Observable, from, lastValueFrom } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { getTenantContext } from '@virteex/kernel-auth';
import { TenantService } from '../tenant.service';
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

    // Data Sovereignty Check
    const requestRegion = process.env['AWS_REGION'] || 'unknown';
    const allowedRegion = config.settings?.['allowedRegion'];

    if (allowedRegion && allowedRegion !== requestRegion) {
      this.logger.error(`Data Sovereignty Violation: Tenant ${tenantId} is restricted to ${allowedRegion} but request reached ${requestRegion}`);
      this.errorCounter.add(1, { tenantId, type: 'sovereignty_violation' });
      throw new ForbiddenException(`Data residency policy violation. This tenant is restricted to region: ${allowedRegion}`);
    }

    if (config.mode === 'SHARED') {
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
    } else if (config.mode === 'DATABASE') {
        // For DB-per-tenant, we ensure we use a dedicated EM fork
        const tenantEm = this.em.fork({ connectionString: config.connectionString });
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
}
