import { AppConfig } from '@virteex/shared-config';

export const environment: AppConfig = {
  production: true,
  apiUrl: (window as any)['env']?.['apiUrl'] || 'https://api.virteex.com/api',
  recaptcha: {
    siteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI' // This should ideally be an env var but for now static
  },
  vapidPublicKey: (window as any)['env']?.['vapidPublicKey'] || ''
};
