import { AsyncLocalStorage } from 'async_hooks';
import { TenantContext } from './tenant-context.interface';
const tenantStorage = new AsyncLocalStorage<TenantContext>();
export const runWithTenantContext = (context, callback) => tenantStorage.run(context, callback);
export const getTenantContext = () => tenantStorage.getStore();
export const requireTenantContext = (reason = 'tenant context is required') => {
  const context = getTenantContext();
  if (!context?.tenantId) throw new Error(reason);
  return context;
};
