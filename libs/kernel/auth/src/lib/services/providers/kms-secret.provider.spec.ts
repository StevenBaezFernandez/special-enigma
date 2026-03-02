import { vi, describe, it, expect } from 'vitest';
import { KmsSecretProvider } from './kms-secret.provider';

describe('KmsSecretProvider', () => {
  it('requires KMS_SECRET_KEYS in production by default', async () => {
    const configService = {
      get: (key: string, defaultValue?: string) => {
        if (key === 'NODE_ENV') return 'production';
        if (key === 'KMS_REQUIRED_IN_PRODUCTION') return defaultValue ?? 'true';
        return undefined;
      }
    } as any;

    const provider = new KmsSecretProvider(configService);
    await expect(provider.initialize()).rejects.toThrow(/KMS_SECRET_KEYS is required/);
  });
});
