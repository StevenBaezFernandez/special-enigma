import { Test, TestingModule } from '@nestjs/testing';
import { WebAuthnService } from './webauthn.service';
import { SecretManagerService } from '@virteex/kernel-auth';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('WebAuthnService', () => {
  let service: WebAuthnService;

  const mockSecretManager = {
    getSecret: vi.fn((key, def) => def),
  };

  beforeEach(async () => {
    service = new WebAuthnService(mockSecretManager as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate registration options', async () => {
    const options = await service.generateRegistrationOptions({
        userID: Uint8Array.from([1, 2, 3]),
        userName: 'user@example.com',
        userDisplayName: 'User Name',
    });
    expect(options).toBeDefined();
    expect(options.rp.name).toBe('Virteex ERP');
    expect(options.user.id).toBe('AQID'); // base64url for [1,2,3] is AQID
  });
});
