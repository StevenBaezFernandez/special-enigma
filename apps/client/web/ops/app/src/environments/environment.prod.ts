import { AppConfig } from '@virteex/shared-config';
export const environment: AppConfig = {
  production: true,
  apiUrl: (window as any)['env']?.['apiUrl'] || '/api',
};
