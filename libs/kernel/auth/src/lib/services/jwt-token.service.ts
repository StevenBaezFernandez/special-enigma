import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { SecretManagerService } from './secret-manager.service';

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
  kty: 'oct';
  alg: jwt.Algorithm;
  k: string;
  use?: string;
}

@Injectable()
export class JwtTokenService {
  private readonly allowedAlgorithms: jwt.Algorithm[];
  private readonly defaultClockSkewSeconds: number;
  private readonly issuerByType: Record<SupportedTokenType, string>;
  private readonly audienceByType: Record<SupportedTokenType, string>;
  private revokedJti = new Map<string, number>();
  private usedJti = new Map<string, number>();

  constructor(private readonly secretManager: SecretManagerService) {
    const algs = this.secretManager
      .getSecret('JWT_ALLOWED_ALGORITHMS', 'HS256')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean) as jwt.Algorithm[];

    this.allowedAlgorithms = algs.length ? algs : ['HS256'];
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

  verifyToken(token: string, tokenType: SupportedTokenType, enforceOneTime = false): jwt.JwtPayload {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded === 'string') {
      throw new UnauthorizedException('Malformed JWT');
    }

    const header = decoded.header as jwt.JwtHeader;
    const payload = decoded.payload as jwt.JwtPayload;

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

    if (this.isRevoked(verified.jti)) {
      throw new UnauthorizedException('JWT revoked');
    }

    if (enforceOneTime) {
      const jti = verified.jti;
      if (!jti || typeof jti !== 'string') {
        throw new UnauthorizedException('JWT missing jti');
      }
      if (this.usedJti.has(jti)) {
        throw new UnauthorizedException('JWT replay detected');
      }
      this.usedJti.set(jti, (verified.exp ?? 0) * 1000);
    }

    this.cleanupCaches();
    return verified;
  }

  revokeToken(jti: string, exp?: number) {
    if (!jti) return;
    const ttl = exp ? exp * 1000 : Date.now() + 15 * 60 * 1000;
    this.revokedJti.set(jti, ttl);
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
      secret: Buffer.from(key.k, 'base64url').toString('utf8'),
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
      secret: Buffer.from(key.k, 'base64url').toString('utf8'),
    };
  }

  private readJwks(): JwkOct[] {
    const raw = this.secretManager.getSecret('JWT_JWKS', '');
    if (raw) {
      const parsed = JSON.parse(raw) as JwkOct[];
      return parsed.filter((entry) => entry.kty === 'oct' && entry.kid && entry.k);
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

  private isRevoked(jti?: string): boolean {
    if (!jti) return false;
    const expiresAt = this.revokedJti.get(jti);
    if (!expiresAt) return false;
    return expiresAt > Date.now();
  }

  private cleanupCaches(): void {
    const now = Date.now();
    for (const [jti, exp] of this.revokedJti.entries()) {
      if (exp <= now) this.revokedJti.delete(jti);
    }
    for (const [jti, exp] of this.usedJti.entries()) {
      if (exp <= now) this.usedJti.delete(jti);
    }
  }
}

function cryptoRandomId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
