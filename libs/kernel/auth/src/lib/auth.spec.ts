import { vi, describe, it, expect } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { SECRET_PROVIDER } from './services/secret-manager.service';
import { ConfigService } from '@nestjs/config';
import { DefaultSecretProvider } from './services/providers/default-secret.provider';
import { VaultSecretProvider } from './services/providers/vault-secret.provider';
import { KmsSecretProvider } from './services/providers/kms-secret.provider';

describe('AuthModule', () => {
  it('should compile', async () => {
    const module = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(SECRET_PROVIDER).useValue({ getSecret: vi.fn() })
      .overrideProvider(DefaultSecretProvider).useValue({})
      .overrideProvider(VaultSecretProvider).useValue({ initialize: vi.fn() })
      .overrideProvider(KmsSecretProvider).useValue({ initialize: vi.fn() })
      .overrideProvider(ConfigService).useValue({ get: vi.fn() })
      .compile();

    expect(module).toBeDefined();
  });
});
