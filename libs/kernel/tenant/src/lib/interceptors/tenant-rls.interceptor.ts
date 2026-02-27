import { CallHandler, ExecutionContext, ForbiddenException, Injectable, NestInterceptor } from '@nestjs/common';
import { EntityManager, RequestContext } from '@mikro-orm/core';
import { Observable, from, lastValueFrom } from 'rxjs';
import { getTenantContext } from '@virteex/kernel-auth';
import { TenantService } from '../tenant.service';

@Injectable()
export class TenantRlsInterceptor implements NestInterceptor {
  constructor(
    private readonly em: EntityManager,
    private readonly tenantService: TenantService
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const tenantContext = getTenantContext();
    if (!tenantContext) {
      const request = context.switchToHttp().getRequest();
      const method = request?.method ?? 'GET';
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        throw new ForbiddenException('Tenant context is required for write operations');
      }
      return next.handle();
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
             return await lastValueFrom(next.handle(), { defaultValue: undefined });
          });
        })
      );
    }

    return next.handle();
  }
}
