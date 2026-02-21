import { AppConfig } from '@virteex/shared-config';

export const environment: AppConfig = {
  production: false,
  apiUrl: (window as any)['env']?.['apiUrl'] || 'http://localhost:3000/api',
  recaptcha: {
    siteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI' // Public Site Key
  },
  vapidPublicKey: 'BK_gXy_yq_placeholder_key' // Placeholder
};
