import { UnauthorizedException } from '@nestjs/common';
import { JwtTokenService } from './jwt-token.service';
import { SecretManagerService } from './secret-manager.service';

describe('JwtTokenService', () => {
  const secrets: Record<string, string> = {
    JWT_SECRET: 'test-secret',
    JWT_ALLOWED_ALGORITHMS: 'HS256',
    JWT_ISSUER: 'virteex-test',
    JWT_AUDIENCE: 'virteex-api',
    JWT_CURRENT_KID: 'kid-a',
    JWT_JWKS: JSON.stringify([
      { kid: 'kid-a', kty: 'oct', alg: 'HS256', k: Buffer.from('test-secret').toString('base64url') },
    ]),
  };

  const secretManager: Partial<SecretManagerService> = {
    getSecret: (key: string, fallback?: string) => secrets[key] ?? fallback ?? '',
    getJwtSecret: () => secrets.JWT_SECRET,
    rotateSecret: jest.fn(),
  };

  let service: JwtTokenService;

  beforeEach(() => {
    service = new JwtTokenService(secretManager as SecretManagerService);
  });

  it('accepts valid token', () => {
    const token = service.issueToken({ sub: 'u1' }, { tokenType: 'access', subject: 'u1' });
    const payload = service.verifyToken(token, 'access');
    expect(payload.sub).toBe('u1');
  });

  it('rejects expired token', () => {
    const token = service.issueToken({ sub: 'u1' }, { tokenType: 'access', subject: 'u1', expiresIn: 1 });
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 5000);
    expect(() => service.verifyToken(token, 'access')).toThrow();
    jest.restoreAllMocks();
  });

  it('rejects wrong issuer', () => {
    const token = service.issueToken({ sub: 'u1' }, { tokenType: 'access', subject: 'u1', issuer: 'bad-issuer' });
    expect(() => service.verifyToken(token, 'access')).toThrow(UnauthorizedException);
  });

  it('rejects wrong audience', () => {
    const token = service.issueToken({ sub: 'u1' }, { tokenType: 'access', subject: 'u1', audience: 'bad-aud' });
    expect(() => service.verifyToken(token, 'access')).toThrow(UnauthorizedException);
  });

  it('rejects invalid algorithm', () => {
    const bad = [
      Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url'),
      Buffer.from(JSON.stringify({ sub: 'u1' })).toString('base64url'),
      '',
    ].join('.');
    expect(() => service.getVerificationSecretForToken(bad)).toThrow(UnauthorizedException);
  });

  it('rejects revoked token', () => {
    const token = service.issueToken({ sub: 'u1' }, { tokenType: 'access', subject: 'u1' });
    const payload = service.verifyToken(token, 'access');
    service.revokeToken(payload.jti as string, payload.exp);
    expect(() => service.verifyToken(token, 'access')).toThrow(UnauthorizedException);
  });

  it('detects replay on one-time token', () => {
    const token = service.issueToken({ sub: 'u1' }, { tokenType: 'stepup', subject: 'u1' });
    service.verifyToken(token, 'stepup', true);
    expect(() => service.verifyToken(token, 'stepup', true)).toThrow(UnauthorizedException);
  });

  it('rejects unknown kid', () => {
    const token = service.issueToken({ sub: 'u1' }, { tokenType: 'access', subject: 'u1', additionalHeaders: { kid: 'invalid-kid' } });
    expect(() => service.verifyToken(token, 'access')).toThrow(UnauthorizedException);
  });
});
