import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { SECRET_PROVIDER, SecretManagerService } from './services/secret-manager.service';
import { JwtTokenService } from './services/jwt-token.service';
import { ConfigService } from '@nestjs/config';
import { DefaultSecretProvider } from './services/providers/default-secret.provider';
import { VaultSecretProvider } from './services/providers/vault-secret.provider';
import { KmsSecretProvider } from './services/providers/kms-secret.provider';
import { TELEMETRY_SERVICE } from '@virteex/kernel-telemetry-interfaces';

describe('AuthModule', () => {
  beforeEach(() => {
    process.env['NODE_ENV'] = 'test';
  });

  afterEach(() => {
    delete process.env['NODE_ENV'];
  });

  it('should compile', async () => {
    const module = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(SECRET_PROVIDER)
      .useValue({
          getSecret: vi.fn().mockImplementation((key, def) => {
              if (key === 'JWT_SECRET') return 'mock-secret';
              if (key === 'JWT_ALLOWED_ALGORITHMS') return 'HS256';
              return def;
          })
      })
      .overrideProvider(SecretManagerService)
      .useValue({
          getSecret: vi.fn().mockReturnValue('mock'),
          getJwtSecret: vi.fn().mockReturnValue('mock'),
          getJwtVerificationSecrets: vi.fn().mockReturnValue(['mock']),
          rotateSecret: vi.fn()
      })
      .overrideProvider(TELEMETRY_SERVICE)
      .useValue({
          recordSecurityEvent: vi.fn(),
          recordBusinessMetric: vi.fn(),
          setTraceAttributes: vi.fn()
      })
      .overrideProvider(JwtTokenService)
      .useValue({ initialize: vi.fn() })
      .overrideProvider(DefaultSecretProvider)
      .useValue({ getSecret: vi.fn() })
      .overrideProvider(VaultSecretProvider)
      .useValue({ initialize: vi.fn().mockResolvedValue(undefined) })
      .overrideProvider(KmsSecretProvider)
      .useValue({ initialize: vi.fn().mockResolvedValue(undefined) })
      .overrideProvider(ConfigService)
      .useValue({ get: vi.fn().mockReturnValue(null) })
      .compile();

    expect(module).toBeDefined();
  });
});
