import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, of, from, tap, switchMap } from 'rxjs';
import { IdempotencyService } from '../services/idempotency.service';
import { getTenantContext } from '@virteex/kernel-auth';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly idempotencyService: IdempotencyService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Idempotency usually applies to mutating methods (POST, PATCH, PUT)
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
        return next.handle();
    }

    const idempotencyKey = request.headers['idempotency-key'];

    if (!idempotencyKey) {
      return next.handle();
    }

    const tenantContext = getTenantContext();
    const tenantId = tenantContext?.tenantId || 'global';

    // Scope key by tenant to prevent collisions
    const cacheKey = `idempotency:${tenantId}:${idempotencyKey}`;

    return from(this.idempotencyService.getResponse(cacheKey)).pipe(
      switchMap(cachedResponse => {
        if (cachedResponse) {
          // Return cached response immediately
          return of(cachedResponse);
        }

        // Execute handler
        return next.handle().pipe(
          tap(response => {
             // Try to set response. If it fails (race condition or Redis down), we just proceed.
             // We use a non-blocking call here.
             this.idempotencyService.setResponse(cacheKey, response);
          })
        );
      })
    );
  }
}
