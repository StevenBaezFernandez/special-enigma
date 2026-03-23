import { InjectionToken } from '@angular/core';

export interface AppConfig {
  apiUrl: string;
  production: boolean;
  vapidPublicKey?: string;
  recaptcha?: {
    siteKey: string;
  };
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
export const API_URL = new InjectionToken<string>('API_URL');

export function getBffUrl(service: string, apiUrl: string): string {
  return `${apiUrl}/${service}`;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  apiUrl: '/api',
  production: false,
  vapidPublicKey: ''
};
