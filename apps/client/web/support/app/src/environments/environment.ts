import { AppConfig } from '@virteex/shared-config';
export const environment: AppConfig = {
  production: false,
  apiUrl: (window as any)['env']?.['apiUrl'] || '/api',
};
