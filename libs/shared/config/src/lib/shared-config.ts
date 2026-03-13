import { InjectionToken } from '@angular/core';

export interface AppConfig {
  apiUrl: string;
  production: boolean;
  vapidPublicKey?: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
export const API_URL = new InjectionToken<string>('API_URL');

export const DEFAULT_APP_CONFIG: AppConfig = {
  apiUrl: '/api',
  production: false,
  vapidPublicKey: ''
};
