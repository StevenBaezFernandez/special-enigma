import { describe, expect, it } from 'vitest';
import { StripePaymentProvider } from './stripe-payment-provider.adapter';

describe('StripePaymentProvider', () => {
  it('fails fast when STRIPE_SECRET_KEY is missing', () => {
    const cfg = { get: (key: string) => (key === 'NODE_ENV' ? 'development' : undefined) } as any;
    expect(() => new StripePaymentProvider(cfg)).toThrow(/STRIPE_SECRET_KEY is required/);
  });

  it('rejects Stripe test key in production', () => {
    const cfg = {
      get: (key: string) => {
        if (key === 'NODE_ENV') return 'production';
        if (key === 'STRIPE_SECRET_KEY') return 'sk_test_123';
        return undefined;
      }
    } as any;

    expect(() => new StripePaymentProvider(cfg)).toThrow(/cannot use Stripe test keys/);
  });
});
