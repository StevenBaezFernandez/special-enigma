export * from './lib/services/session.service';
export * from './lib/services/token.service';
export * from './lib/services/storage/secure-storage.service';
export * from './lib/guards/auth.guard';
export * from './lib/interceptors/auth.interceptor';

export function hasPermission(userPermissions: string[] | undefined, requiredPermissions: string[]): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  return requiredPermissions.every(permission => userPermissions.includes(permission));
}
