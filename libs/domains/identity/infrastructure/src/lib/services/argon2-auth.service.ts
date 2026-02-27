import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@virteex/domain-identity-domain';
import { authenticator } from '@otplib/preset-default';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import { JwtTokenService, SecretManagerService } from '@virteex/kernel-auth';

interface JwtPayload {
  [key: string]: unknown;
}

@Injectable()
export class Argon2AuthService implements AuthService {
  private readonly secret: string;
  private readonly encryptionKey: Buffer;
  private readonly algorithm = 'aes-256-gcm';

  constructor(private secretManager: SecretManagerService, private readonly jwtTokenService: JwtTokenService) {
    this.secret = this.secretManager.getJwtSecret();
    if (!this.secret) {
      throw new Error('JWT_SECRET is not defined in secret manager.');
    }

    const mfaKey = this.secretManager.getSecret('MFA_ENCRYPTION_KEY', this.secret);
    const isProd = process.env['NODE_ENV'] === 'production';
    const salt = this.secretManager.getSecret('ENCRYPTION_SALT', isProd ? undefined : 'default-salt-for-dev-only');

    if (isProd && !salt) {
        throw new Error('ENCRYPTION_SALT must be defined in production!');
    }

    // Derive a 32-byte key using strict scrypt params
    this.encryptionKey = crypto.scryptSync(mfaKey, salt, 32);
  }

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
    });
  }

  async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    try {
      return await argon2.verify(storedHash, password);
    } catch (err) {
      return false;
    }
  }

  async generateToken(payload: any, options?: { tokenType?: "access" | "refresh" | "service" | "plugin" | "stepup"; expiresIn?: string | number; audience?: string; issuer?: string; subject?: string }): Promise<string> {
    return this.jwtTokenService.issueToken(payload, {
      tokenType: options?.tokenType ?? "access",
      expiresIn: options?.expiresIn,
      audience: options?.audience,
      issuer: options?.issuer,
      subject: options?.subject,
    });
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtTokenService.verifyToken(token, "access");
    } catch (error: any) {
      if (error?.name === "TokenExpiredError") {
        throw new UnauthorizedException("Token expired");
      }
      throw new UnauthorizedException("Invalid or expired token");
    }
  }

  generateMfaSecret(): string {
    return authenticator.generateSecret();
  }

  verifyMfaToken(token: string, secret: string): boolean {
    try {
      return authenticator.check(token, secret);
    } catch {
      return false;
    }
  }

  async encrypt(text: string): Promise<string> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
  }

  async decrypt(text: string): Promise<string> {
    const parts = text.split(':');
    if (parts.length !== 3) throw new Error('Invalid encrypted text format');
    const [ivHex, encryptedHex, authTagHex] = parts;

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
