export function resolveStripeSecretKey(nodeEnv: string | undefined, configuredValue: string | undefined): string {
  const secretKey = configuredValue?.trim();
  const environment = nodeEnv ?? 'development';

  if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY. Stripe integration cannot start without a configured secret key.');
  }

  if (/placeholder|changeme|demo/i.test(secretKey)) {
    throw new Error('STRIPE_SECRET_KEY cannot be a placeholder/demo value.');
  }

  if (environment === 'production' && secretKey.startsWith('sk_test_')) {
    throw new Error('Production requires a live Stripe secret key (sk_live_*).');
  }

  return secretKey;
}
