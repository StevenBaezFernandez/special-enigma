import { InjectionToken } from '@angular/core';

export interface AppConfig {
  production: boolean;
  apiUrl: string;
  recaptcha?: {
    siteKey: string;
  };
  vapidPublicKey?: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
