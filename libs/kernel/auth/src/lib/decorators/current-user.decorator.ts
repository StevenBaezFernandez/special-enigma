import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtPayload } from 'jsonwebtoken';

export interface UserPayload extends JwtPayload {
  userId: string;
  email: string;
  tenantId?: string;
  roles?: string[];
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserPayload => {
    let request;
    if (ctx.getType().toString() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(ctx);
      request = gqlContext.getContext().req;
    } else {
      request = ctx.switchToHttp().getRequest();
    }
    return request.user;
  },
);

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    let request;
    if (ctx.getType().toString() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(ctx);
      request = gqlContext.getContext().req;
    } else {
      request = ctx.switchToHttp().getRequest();
    }
    return request.tenantContext?.tenantId || request.headers['x-virteex-tenant-id'] || request.headers['x-tenant-id'];
  },
);
