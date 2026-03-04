import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { randomBytes, randomUUID } from 'node:crypto';
import { SecretManagerService } from './secret-manager.service';
import { TelemetryService } from '@virteex/kernel-telemetry';
import Redis from 'ioredis';

export type SupportedTokenType = 'access' | 'refresh' | 'service' | 'plugin' | 'stepup';

export interface TokenIssueOptions {
  tokenType: SupportedTokenType;
  audience?: string;
  issuer?: string;
  expiresIn?: string | number;
  subject?: string;
  additionalHeaders?: jwt.JwtHeader;
}

interface JwkOct {
  kid: string;
  kty: 'oct' | 'RSA' | 'EC';
  alg: jwt.Algorithm;
  k?: string;
  n?: string;
  e?: string;
  x?: string;
  y?: string;
  use?: string;
}

@Injectable()
export class JwtTokenService {
  private readonly allowedAlgorithms: jwt.Algorithm[];
  private readonly defaultClockSkewSeconds: number;
  private readonly issuerByType: Record<SupportedTokenType, string>;
  private readonly audienceByType: Record<SupportedTokenType, string>;
  private readonly redis: Redis | null = null;
  private readonly logger = new Logger(JwtTokenService.name);
  private readonly isProduction: boolean;

  constructor(private readonly secretManager: SecretManagerService, private readonly telemetry: TelemetryService) {
    this.isProduction = process.env['NODE_ENV'] === 'production';

    const algs = this.secretManager
      .getSecret('JWT_ALLOWED_ALGORITHMS', 'HS256')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean) as jwt.Algorithm[];

    this.allowedAlgorithms = algs.length ? algs : ['HS256'];
    this.enforceProductionAlgorithmPolicy();

    this.defaultClockSkewSeconds = Number(this.secretManager.getSecret('JWT_CLOCK_SKEW_SECONDS', '30'));

    this.issuerByType = {
      access: this.secretManager.getSecret('JWT_ISSUER_ACCESS', this.secretManager.getSecret('JWT_ISSUER', 'virteex-issuer')),
      refresh: this.secretManager.getSecret('JWT_ISSUER_REFRESH', this.secretManager.getSecret('JWT_ISSUER', 'virteex-issuer')),
      service: this.secretManager.getSecret('JWT_ISSUER_SERVICE', this.secretManager.getSecret('JWT_ISSUER', 'virteex-issuer')),
      plugin: this.secretManager.getSecret('JWT_ISSUER_PLUGIN', this.secretManager.getSecret('JWT_ISSUER', 'virteex-issuer')),
      stepup: this.secretManager.getSecret('JWT_ISSUER_STEPUP', this.secretManager.getSecret('JWT_ISSUER', 'virteex-issuer')),
    };

    this.audienceByType = {
      access: this.secretManager.getSecret('JWT_AUDIENCE_ACCESS', this.secretManager.getSecret('JWT_AUDIENCE', 'virteex-api')),
      refresh: this.secretManager.getSecret('JWT_AUDIENCE_REFRESH', this.secretManager.getSecret('JWT_AUDIENCE', 'virteex-api')),
      service: this.secretManager.getSecret('JWT_AUDIENCE_SERVICE', this.secretManager.getSecret('JWT_AUDIENCE', 'virteex-internal')),
      plugin: this.secretManager.getSecret('JWT_AUDIENCE_PLUGIN', this.secretManager.getSecret('JWT_AUDIENCE', 'virteex-plugin-host')),
      stepup: this.secretManager.getSecret('JWT_AUDIENCE_STEPUP', this.secretManager.getSecret('JWT_AUDIENCE', 'virteex-api')),
    };

    const redisUrl = process.env['REDIS_URL'];
    if (redisUrl) {
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
      });
    }

    this.readJwks();
  }

  issueToken(payload: Record<string, unknown>, options: TokenIssueOptions): string {
    const key = this.resolveSigningKey();

    const tokenType = options.tokenType;
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = options.expiresIn ?? this.resolveDefaultExpiry(tokenType);
    const jti = cryptoRandomId();

    const signedPayload: Record<string, unknown> = {
      ...payload,
      iat: now,
      nbf: now,
      jti,
      typ: `virteex+${tokenType}`,
      token_use: tokenType,
    };

    return jwt.sign(signedPayload, key.secret, {
      algorithm: key.alg,
      expiresIn,
      issuer: options.issuer ?? this.issuerByType[tokenType],
      audience: options.audience ?? this.audienceByType[tokenType],
      subject: options.subject,
      header: {
        kid: key.kid,
        typ: 'JWT',
        ...(options.additionalHeaders ?? {}),
      },
    } as jwt.SignOptions);
  }

  getVerificationSecretForToken(token: string): string {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded === 'string') {
      throw new UnauthorizedException('Malformed JWT');
    }

    const header = decoded.header as jwt.JwtHeader;
    if (!header.alg || header.alg.toLowerCase() === 'none') {
      throw new UnauthorizedException('Rejected JWT algorithm');
    }
    if (!this.allowedAlgorithms.includes(header.alg as jwt.Algorithm)) {
      throw new UnauthorizedException('Unsupported JWT algorithm');
    }

    return this.resolveVerificationKey(header.kid).secret;
  }

  async verifyToken(token: string, tokenType: SupportedTokenType, enforceOneTime = false): Promise<jwt.JwtPayload> {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded === 'string') {
      throw new UnauthorizedException('Malformed JWT');
    }

    const header = decoded.header as jwt.JwtHeader;

    if (!header.alg || header.alg.toLowerCase() === 'none') {
      throw new UnauthorizedException('Rejected JWT algorithm');
    }
    if (!this.allowedAlgorithms.includes(header.alg as jwt.Algorithm)) {
      throw new UnauthorizedException('Unsupported JWT algorithm');
    }

    const key = this.resolveVerificationKey(header.kid);
    if (key.alg !== header.alg) {
      throw new UnauthorizedException('JWT kid/alg mismatch');
    }

    const verified = jwt.verify(token, key.secret, {
      algorithms: this.allowedAlgorithms,
      issuer: this.issuerByType[tokenType],
      audience: this.audienceByType[tokenType],
      clockTolerance: this.defaultClockSkewSeconds,
    }) as jwt.JwtPayload;

    if (!verified.sub || typeof verified.sub !== 'string') {
      throw new UnauthorizedException('JWT missing valid sub');
    }
    if (!verified.iat || !verified.nbf) {
      throw new UnauthorizedException('JWT missing iat/nbf');
    }
    if (verified['typ'] !== `virteex+${tokenType}` || verified['token_use'] !== tokenType) {
      throw new UnauthorizedException('JWT token type mismatch');
    }

    if (await this.isRevoked(verified.jti)) {
      throw new UnauthorizedException('JWT revoked');
    }

    if (enforceOneTime) {
      const jti = verified.jti;
      if (!jti || typeof jti !== 'string') {
        throw new UnauthorizedException('JWT missing jti');
      }
      if (await this.isUsed(jti)) {
        throw new UnauthorizedException('JWT replay detected');
      }
      await this.markAsUsed(jti, verified.exp ?? 0);
    }

    return verified;
  }

  async revokeToken(jti: string, exp?: number) {
    if (!jti) return;
    const ttlSeconds = exp ? exp - Math.floor(Date.now() / 1000) : 15 * 60;
    if (ttlSeconds <= 0) return;

    if (this.redis) {
      await this.redis.set(`revoked:${jti}`, '1', 'EX', ttlSeconds);
    } else {
      this.logger.error('Redis not configured: Cannot revoke token.');
    }
  }

  rotateKeys(): void {
    this.secretManager.rotateSecret();
  }

  private resolveDefaultExpiry(type: SupportedTokenType): string {
    switch (type) {
      case 'refresh':
        return this.secretManager.getSecret('JWT_REFRESH_EXPIRATION', '7d');
      case 'service':
      case 'plugin':
        return this.secretManager.getSecret('JWT_SERVICE_EXPIRATION', '5m');
      case 'stepup':
        return this.secretManager.getSecret('JWT_STEPUP_EXPIRATION', '5m');
      default:
        return this.secretManager.getSecret('JWT_EXPIRATION', '15m');
    }
  }

  private resolveSigningKey() {
    const jwks = this.readJwks();
    const preferredKid = this.secretManager.getSecret('JWT_CURRENT_KID', jwks[0]?.kid ?? 'default');
    const key = jwks.find((item) => item.kid === preferredKid) ?? jwks[0];
    if (!key) {
      throw new Error('No JWT signing key available');
    }
    return {
      kid: key.kid,
      alg: key.alg,
      secret: key.k ? Buffer.from(key.k, 'base64url').toString('utf8') : this.secretManager.getJwtSecret(),
    };
  }

  private resolveVerificationKey(kid?: string) {
    const jwks = this.readJwks();
    const key = jwks.find((entry) => entry.kid === kid);
    if (!key) {
      throw new UnauthorizedException('Unknown JWT kid');
    }

    return {
      kid: key.kid,
      alg: key.alg,
      secret: key.k ? Buffer.from(key.k, 'base64url').toString('utf8') : this.secretManager.getJwtSecret(),
    };
  }

  private readJwks(): JwkOct[] {
    const raw = this.secretManager.getSecret('JWT_JWKS', '');
    if (raw) {
      const parsed = JSON.parse(raw) as JwkOct[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('JWT_JWKS must contain at least one key');
      }
      return parsed;
    }

    if (this.isProduction) {
      throw new Error('JWT_JWKS is mandatory in production. Symmetric secret fallback is disabled.');
    }

    const secret = this.secretManager.getJwtSecret();
    return [
      {
        kid: this.secretManager.getSecret('JWT_CURRENT_KID', 'default'),
        kty: 'oct',
        alg: this.allowedAlgorithms[0],
        k: Buffer.from(secret).toString('base64url'),
      },
    ];
  }

  private async isRevoked(jti?: string): Promise<boolean> {
    if (!jti) return false;
    if (!this.redis) {
      if (this.isProduction) {
        this.logger.error('FAIL-CLOSED: Redis not configured for revocation check.');
        return true;
      }
      return false;
    }
    try {
      const res = await this.redis.get(`revoked:${jti}`);
      return res === '1';
    } catch (e) {
      this.logger.error(`Redis error during revocation check: ${e}`);
      if (this.isProduction) return true;
      return false;
    }
  }

  private async isUsed(jti: string): Promise<boolean> {
    if (!this.redis) {
      if (this.isProduction) {
        this.logger.error('FAIL-CLOSED: Redis not configured for replay check.');
        return true;
      }
      return false;
    }
    try {
      const res = await this.redis.get(`used:${jti}`);
      return res === '1';
    } catch (e) {
      this.logger.error(`Redis error during replay check: ${e}`);
      if (this.isProduction) return true;
      return false;
    }
  }

  private async markAsUsed(jti: string, exp: number): Promise<void> {
    if (!this.redis) return;
    const ttlSeconds = exp - Math.floor(Date.now() / 1000);
    if (ttlSeconds > 0) {
      await this.redis.set(`used:${jti}`, '1', 'EX', ttlSeconds).catch((e) => {
        this.logger.error(`Failed to mark jti as used in Redis: ${e}`);
      });
    }
  }

  private enforceProductionAlgorithmPolicy(): void {
    if (!this.isProduction) {
      return;
    }

    const insecureAlgs = this.allowedAlgorithms.filter((algorithm) => algorithm.startsWith('HS'));
    if (insecureAlgs.length === 0) {
      return;
    }

    const allowOverride = this.secretManager.getSecret('JWT_ALLOW_HS_IN_PRODUCTION', 'false') === 'true';
    const overrideAuditRef = this.secretManager.getSecret('JWT_HS_OVERRIDE_AUDIT_REF', '').trim();

    if (!allowOverride || !overrideAuditRef) {
      throw new Error(
        `Insecure JWT algorithms in production (${insecureAlgs.join(',')}) are blocked. ` +
          'Set JWT_ALLOW_HS_IN_PRODUCTION=true and JWT_HS_OVERRIDE_AUDIT_REF=<ticket> for audited override.',
      );
    }

    this.logger.warn(
      `Audited override enabled for HMAC JWT algorithms in production (${insecureAlgs.join(',')}). ` +
        `audit_ref=${overrideAuditRef}`,
    );

    this.telemetry.recordSecurityEvent('BREAK_GLASS_JWT_ALGORITHM_OVERRIDE', {
      algorithms: insecureAlgs.join(','),
      auditReference: overrideAuditRef,
      service: 'kernel-auth',
      environment: process.env['NODE_ENV'] || 'unknown',
      timestamp: new Date().toISOString(),
    });
  }
}

function cryptoRandomId(): string {
  if (typeof randomUUID === 'function') {
    return randomUUID();
  }
  return randomBytes(16).toString('hex');
}
