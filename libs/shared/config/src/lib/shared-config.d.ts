import { InjectionToken } from '@angular/core';
export interface AppConfig {
    apiUrl: string;
    production: boolean;
    vapidPublicKey?: string;
    recaptcha?: {
        siteKey: string;
    };
}
export declare const APP_CONFIG: InjectionToken<AppConfig>;
export declare const API_URL: InjectionToken<string>;
export declare function getBffUrl(service: string, apiUrl: string): string;
export declare const DEFAULT_APP_CONFIG: AppConfig;
