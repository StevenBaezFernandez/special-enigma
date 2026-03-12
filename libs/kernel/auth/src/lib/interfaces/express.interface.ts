import { TenantContext } from '@virteex/kernel-tenant-context';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      tenantContext?: TenantContext;
      user?: any;
    }
  }
}
