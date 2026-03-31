import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class PresentationLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PresentationLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();
    let method = 'UNKNOWN';
    let url = 'UNKNOWN';
    let transport = 'HTTP';

    if (context.getType().toString() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const info = gqlCtx.getInfo();
      method = info.operation.operation.toUpperCase();
      url = info.fieldName;
      transport = 'GraphQL';
    } else {
      const request = context.switchToHttp().getRequest();
      method = request.method;
      url = request.url;
    }

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        this.logger.log(`[${transport}] ${method} ${url} completed in ${duration}ms`);
      })
    );
  }
}
