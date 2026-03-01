import { Observable, of } from 'rxjs';
export * from './lib/guards/auth.guard';
export * from './lib/interceptors/auth.interceptor';
export * from './lib/services/token.service';
export * from './lib/services/session.service';
export const hasPermission = (permissions: string[] | undefined, required: string[]) => {
  if (!required || required.length === 0) return true;
  if (!permissions) return false;
  return required.every(p => permissions.includes(p));
};
