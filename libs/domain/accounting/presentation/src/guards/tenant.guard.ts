import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    let request;
    if (context.getType().toString() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      request = gqlContext.getContext().req;
    } else {
      request = context.switchToHttp().getRequest();
    }

    const tenantId = request.headers['x-virteex-tenant-id'] || request.headers['x-tenant-id'];

    if (!tenantId) {
      throw new ForbiddenException('Tenant identification is required for this operation.');
    }

    return true;
  }
}
