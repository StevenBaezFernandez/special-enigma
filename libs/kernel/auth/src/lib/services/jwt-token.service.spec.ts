import { vi, describe, it, expect, beforeEach, afterAll } from 'vitest';
import { JwtTokenService, TokenIssueOptions } from './jwt-token.service';
import * as jwt from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';

vi.mock('ioredis', () => {
  return {
    default: vi.fn().mockImplementation(function() {
      return {
        get: vi.fn(),
        set: vi.fn(),
        on: vi.fn(),
      };
    }),
  };
});

describe('JwtTokenService', () => {
  let service: JwtTokenService;
  const originalNodeEnv = process.env['NODE_ENV'];
  const originalRedisUrl = process.env['REDIS_URL'];

  const buildJwks = (secret: string, kid = 'default', alg: string = 'HS256') =>
    JSON.stringify([
      {
        kid,
        kty: 'oct',
        alg,
        k: Buffer.from(secret).toString('base64url'),
      },
    ]);

  const createMockSecretManager = (overrides: Record<string, string> = {}) => {
    const defaults: Record<string, string> = {
      JWT_ALLOWED_ALGORITHMS: 'HS256',
      JWT_JWKS: buildJwks('super-secret'),
      JWT_CURRENT_KID: 'default',
      JWT_ISSUER: 'virteex-issuer',
      JWT_AUDIENCE: 'virteex-api',
      JWT_ALLOW_HS_IN_PRODUCTION: 'false',
      JWT_HS_OVERRIDE_AUDIT_REF: '',
    };

    const secretValues = {
      ...defaults,
      ...overrides,
    };

    return {
      getSecret: vi.fn().mockImplementation((key: string, def?: string) => {
        const value = secretValues[key];
        return value ?? def;
      }),
      getJwtSecret: vi.fn().mockReturnValue('super-secret'),
      getJwtVerificationSecrets: vi.fn().mockReturnValue(['super-secret']),
      rotateSecret: vi.fn(),
    } as any;
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env['NODE_ENV'] = 'test';
    process.env['REDIS_URL'] = 'redis://localhost:6379';

    const mockSecretManager = createMockSecretManager();
    service = new JwtTokenService(mockSecretManager);
  });

  afterAll(() => {
    process.env['NODE_ENV'] = originalNodeEnv;
    process.env['REDIS_URL'] = originalRedisUrl;
  });

  it('should issue and verify a token', async () => {
    const payload = { org: 'virteex' };
    const options: TokenIssueOptions = { tokenType: 'access', subject: 'user123' };

    const token = service.issueToken(payload, options);
    expect(token).toBeDefined();

    const verified = await service.verifyToken(token, 'access');
    expect(verified.sub).toBe('user123');
  });

  it('should check for revoked tokens in redis', async () => {
    const payload = { org: 'virteex' };
    const options: TokenIssueOptions = { tokenType: 'access', subject: 'user123' };
    const token = service.issueToken(payload, options);
    const decoded: any = jwt.decode(token);

    (service as any).redis = {
        get: vi.fn().mockImplementation((key: string) => {
            if (key === `revoked:${decoded.jti}`) return Promise.resolve('1');
            return Promise.resolve(null);
        }),
        set: vi.fn().mockResolvedValue('OK')
    };

    await expect(service.verifyToken(token, 'access')).rejects.toThrow('JWT revoked');
  });

  it('should detect replay with enforceOneTime', async () => {
    const payload = { org: 'virteex' };
    const token = service.issueToken(payload, { tokenType: 'stepup', subject: 'user123' });

    const redisGet = vi.fn().mockResolvedValue(null);
    (service as any).redis = {
        get: redisGet,
        set: vi.fn().mockResolvedValue('OK')
    };

    await service.verifyToken(token, 'stepup', true);
    expect((service as any).redis.set).toHaveBeenCalled();

    redisGet.mockImplementation((key: string) => {
        if (key.startsWith('used:')) return Promise.resolve('1');
        return Promise.resolve(null);
    });

    await expect(service.verifyToken(token, 'stepup', true)).rejects.toThrow('JWT replay detected');
  });

  it('should fail-closed in production when JWT_JWKS is missing', async () => {
    process.env['NODE_ENV'] = 'production';
    const mockSecretManager = createMockSecretManager({
        JWT_JWKS: '',
        JWT_ALLOWED_ALGORITHMS: 'RS256'
    });

    expect(() => new JwtTokenService(mockSecretManager)).toThrow('JWT_JWKS is mandatory in production');
  });
});
