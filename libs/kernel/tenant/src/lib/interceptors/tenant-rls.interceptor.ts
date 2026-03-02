import { CallHandler, ExecutionContext, ForbiddenException, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { EntityManager, RequestContext } from '@mikro-orm/core';
import { Observable, from, lastValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';
import { getTenantContext } from '@virteex/kernel-auth';
import { TenantService } from '../tenant.service';

@Injectable()
export class TenantRlsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TenantRlsInterceptor.name);

  constructor(
    private readonly em: EntityManager,
    private readonly tenantService: TenantService
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const startTime = performance.now();
    const tenantContext = getTenantContext();
    if (!tenantContext) {
      // SECURITY: Closed-by-default. No operation allowed without a valid tenant context.
      // Previous version allowed GET requests to bypass this check.
      throw new ForbiddenException('Tenant context is required for all operations');
    }

    const config = await this.tenantService.getTenantConfig(tenantContext.tenantId);

    if (config.mode === 'SHARED') {
      return from(
        this.em.transactional(async (txEm) => {
          await txEm.getConnection().execute('SET LOCAL app.current_tenant = ?', [tenantContext.tenantId]);
          await txEm.getConnection().execute('SET LOCAL app.tenant_enforced = ?', ['true']);

          // Also set the MikroORM global filter for non-RLS scenarios or additional safety
          txEm.setFilterParams('tenant', { tenantId: tenantContext.tenantId });

          // Propagate the transactional EM to the request context
          return await RequestContext.create(txEm, async () => {
             const result = await lastValueFrom(next.handle(), { defaultValue: undefined });
             const duration = performance.now() - startTime;
             this.logger.log(`RLS SHARED query completed for tenant ${tenantContext.tenantId} in ${duration.toFixed(2)}ms`);
             return result;
          });
        })
      );
    }

    return next.handle().pipe(
        tap(() => {
            const duration = performance.now() - startTime;
            this.logger.log(`RLS NON-SHARED operation completed for tenant ${tenantContext.tenantId} in ${duration.toFixed(2)}ms`);
        })
    );
  }
}
