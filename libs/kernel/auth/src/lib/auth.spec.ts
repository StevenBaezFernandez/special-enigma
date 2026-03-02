import { vi, describe, it, expect } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { SECRET_PROVIDER } from './services/secret-manager.service';
import { ConfigService } from '@nestjs/config';

describe('AuthModule', () => {
  it('should compile', async () => {
    const mockSecretProvider = {
        getSecret: vi.fn().mockReturnValue(null),
        initialize: vi.fn().mockResolvedValue(undefined)
    };

    const module = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(SECRET_PROVIDER)
      .useValue(mockSecretProvider)
      .overrideProvider(ConfigService)
      .useValue({
        get: vi.fn().mockReturnValue(null),
      })
      .compile();

    expect(module).toBeDefined();
  });
});
