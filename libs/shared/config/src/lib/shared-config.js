import { InjectionToken } from '@angular/core';
export const APP_CONFIG = new InjectionToken('APP_CONFIG');
export const API_URL = new InjectionToken('API_URL');
export function getBffUrl(service, apiUrl) {
    return `${apiUrl}/${service}`;
}
export const DEFAULT_APP_CONFIG = {
    apiUrl: '/api',
    production: false,
    vapidPublicKey: ''
};
//# sourceMappingURL=shared-config.js.map