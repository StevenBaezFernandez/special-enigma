export const hasPermission = (permissions: string[] | undefined, required: string[]) => {
  if (!required || required.length === 0) return true;
  if (!permissions) return false;
  return required.every(p => permissions.includes(p));
};

export * from './lib/services/storage/secure-storage.service';
