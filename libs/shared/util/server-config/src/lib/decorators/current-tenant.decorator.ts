import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Priority: tenantId (if flattened), company.id (if relation loaded), companyId (if foreign key)
    const tenantId = user?.tenantId || user?.company?.id || user?.companyId;

    return tenantId;
  },
);
