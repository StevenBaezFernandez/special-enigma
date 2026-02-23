/* eslint-disable @typescript-eslint/no-namespace */
import { TenantContext } from './tenant-context.interface';

declare global {
  namespace Express {
    interface Request {
      tenantContext: TenantContext;
    }
  }
}
