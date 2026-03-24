import { InjectionToken } from '@angular/core';

export const RECAPTCHA_SITE_KEY = new InjectionToken<string>('RECAPTCHA_SITE_KEY', {
  providedIn: 'root',
  factory: () => {
    return 'RECAPTCHA_SITE_KEY_REQUIRED';
  }
});
