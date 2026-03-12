import { getTenantContext as getContext } from '@virteex/kernel-tenant-context';

export const getTenantContext = () => {
  return getContext();
};
