import { describe, expect, it } from 'vitest';
import { resolveStripeSecretKey } from './stripe-runtime-config.service';

describe('resolveStripeSecretKey', () => {
  it('rejects missing key', () => {
    expect(() => resolveStripeSecretKey('development', undefined)).toThrow(/Missing STRIPE_SECRET_KEY/);
  });

  it('rejects placeholder key', () => {
    expect(() => resolveStripeSecretKey('development', 'sk_test_placeholder')).toThrow(/placeholder/);
  });

  it('rejects test key in production', () => {
    expect(() => resolveStripeSecretKey('production', 'sk_test_123')).toThrow(/sk_live/);
  });

  it('accepts live key in production', () => {
    expect(resolveStripeSecretKey('production', 'sk_live_123')).toBe('sk_live_123');
  });
});
