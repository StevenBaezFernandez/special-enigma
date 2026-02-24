import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
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
      return next.handle();
    }

    const config = await this.tenantService.getTenantConfig(tenantContext.tenantId);

    if (config.mode === 'SHARED') {
      return from(
        this.em.transactional(async (txEm) => {
          await txEm.getConnection().execute('SET LOCAL app.current_tenant = ?', [tenantContext.tenantId]);
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
