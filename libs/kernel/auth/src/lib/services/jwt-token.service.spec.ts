import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtTokenService, TokenIssueOptions } from './jwt-token.service';
import { SecretManagerService } from './secret-manager.service';
import * as jwt from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';
import Redis from 'ioredis';

vi.mock('./secret-manager.service');
vi.mock('ioredis');

describe('JwtTokenService', () => {
  let service: JwtTokenService;
  let redisMock: { get: jest.Mock; set: jest.Mock };
  const originalNodeEnv = process.env['NODE_ENV'];
  const originalRedisUrl = process.env['REDIS_URL'];

  const buildJwks = (secret: string, kid = 'default', alg: jwt.Algorithm = 'HS256') =>
    JSON.stringify([
      {
        kid,
        kty: 'oct',
        alg,
        k: Buffer.from(secret).toString('base64url'),
      },
    ]);

  const createService = async (overrides: Record<string, string> = {}) => {
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtTokenService,
        {
          provide: SecretManagerService,
          useValue: {
            getSecret: vi.fn().mockImplementation((key: string, def?: string) => {
              const value = secretValues[key];
              return value ?? def;
            }),
            getJwtSecret: vi.fn().mockReturnValue('super-secret'),
          },
        },
      ],
    }).compile();

    return module.get<JwtTokenService>(JwtTokenService);
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env['NODE_ENV'] = 'test';
    process.env['REDIS_URL'] = 'redis://localhost:6379';

    redisMock = {
      get: vi.fn(),
      set: vi.fn(),
    };
    (Redis as unknown as jest.Mock).mockImplementation(() => redisMock);

    service = await createService();
  });

  afterAll(() => {
    process.env['NODE_ENV'] = originalNodeEnv;
    process.env['REDIS_URL'] = originalRedisUrl;
  });

  it('should issue and verify a token', async () => {
    const payload = { sub: 'user123' };
    const options: TokenIssueOptions = { tokenType: 'access' };

    const token = service.issueToken(payload, options);
    expect(token).toBeDefined();

    const verified = await service.verifyToken(token, 'access');
    expect(verified.sub).toBe('user123');
  });

  it('should fail if algorithm is none', async () => {
    const payload = { sub: 'user123' };
    const token = jwt.sign(payload, '', { algorithm: 'none' } as any);

    await expect(service.verifyToken(token, 'access')).rejects.toThrow(UnauthorizedException);
  });

  it('should fail if algorithm is not in allow-list', async () => {
    const token = jwt.sign({ sub: 'user123' }, 'super-secret', {
      algorithm: 'HS512',
      header: { kid: 'default' },
      issuer: 'virteex-issuer',
      audience: 'virteex-api',
      expiresIn: '15m',
    });

    await expect(service.verifyToken(token, 'access')).rejects.toThrow('Unsupported JWT algorithm');
  });

  it('should check for revoked tokens in redis', async () => {
    const payload = { sub: 'user123' };
    const token = service.issueToken(payload, { tokenType: 'access' });
    const decoded: any = jwt.decode(token);

    redisMock.get.mockResolvedValue('1');

    await expect(service.verifyToken(token, 'access')).rejects.toThrow('JWT revoked');
    expect(redisMock.get).toHaveBeenCalledWith(`revoked:${decoded.jti}`);
  });

  it('should detect replay with enforceOneTime', async () => {
    const payload = { sub: 'user123' };
    const token = service.issueToken(payload, { tokenType: 'stepup' });

    redisMock.get.mockResolvedValue(null);
    await service.verifyToken(token, 'stepup', true);
    expect(redisMock.set).toHaveBeenCalled();

    redisMock.get.mockResolvedValue('1');
    await expect(service.verifyToken(token, 'stepup', true)).rejects.toThrow('JWT replay detected');
  });

  it('should fail-closed in production when JWT_JWKS is missing', async () => {
    process.env['NODE_ENV'] = 'production';

    await expect(
      createService({
        JWT_ALLOWED_ALGORITHMS: 'RS256',
        JWT_JWKS: '',
      }),
    ).rejects.toThrow('JWT_JWKS is mandatory in production');
  });

  it('should block HS* algorithms in production without audited override', async () => {
    process.env['NODE_ENV'] = 'production';

    await expect(
      createService({
        JWT_ALLOWED_ALGORITHMS: 'HS256',
        JWT_JWKS: buildJwks('super-secret', 'default', 'HS256'),
        JWT_ALLOW_HS_IN_PRODUCTION: 'false',
        JWT_HS_OVERRIDE_AUDIT_REF: '',
      }),
    ).rejects.toThrow('Insecure JWT algorithms in production');
  });

  it('should fail-closed in production when Redis is missing', async () => {
    process.env['NODE_ENV'] = 'production';
    delete process.env['REDIS_URL'];

    const prodService = await createService({
      JWT_ALLOWED_ALGORITHMS: 'HS256',
      JWT_JWKS: buildJwks('super-secret', 'default', 'HS256'),
      JWT_ALLOW_HS_IN_PRODUCTION: 'true',
      JWT_HS_OVERRIDE_AUDIT_REF: 'SEC-1234',
    });

    const token = prodService.issueToken({ sub: 'user123' }, { tokenType: 'access' });
    await expect(prodService.verifyToken(token, 'access')).rejects.toThrow('JWT revoked');
  });
});
