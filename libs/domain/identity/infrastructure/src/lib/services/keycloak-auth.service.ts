import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from '@virteex/domain-identity-domain';
import { JwtTokenService, SecretManagerService } from '@virteex/kernel-auth';
import * as jwt from 'jsonwebtoken';
import { authenticator } from '@otplib/preset-default';
import * as crypto from 'crypto';

@Injectable()
export class KeycloakAuthService implements AuthService {
  private readonly logger = new Logger(KeycloakAuthService.name);
  private readonly clientSecret: string;
  private readonly issuer: string;
  private readonly encryptionKey: Buffer;
  private readonly algorithm = 'aes-256-gcm';

  constructor(private secretManager: SecretManagerService, private readonly jwtTokenService: JwtTokenService) {
      this.clientSecret = this.secretManager.getSecret('KEYCLOAK_CLIENT_SECRET', 'dev-keycloak-secret');
      this.issuer = this.secretManager.getSecret('KEYCLOAK_ISSUER', 'https://keycloak.virteex.com/auth/realms/virteex');

      const mfaKey = this.secretManager.getSecret('MFA_ENCRYPTION_KEY', this.clientSecret);
      const salt = this.secretManager.getSecret('ENCRYPTION_SALT', 'keycloak-default-salt');
      this.encryptionKey = crypto.scryptSync(mfaKey, salt, 32);
  }

  async hashPassword(password: string): Promise<string> {
      throw new Error('Method not implemented: Keycloak handles password hashing.');
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
      throw new Error('Method not implemented: Keycloak handles password verification via OIDC flow.');
  }

  async generateToken(payload: any, options?: { tokenType?: "access" | "refresh" | "service" | "plugin" | "stepup"; expiresIn?: string | number; audience?: string; issuer?: string; subject?: string }): Promise<string> {
      return this.jwtTokenService.issueToken(payload, {
          tokenType: options?.tokenType ?? "service",
          expiresIn: options?.expiresIn ?? "1h",
          issuer: options?.issuer ?? this.issuer,
          audience: options?.audience,
          subject: options?.subject
      });
  }

  async verifyToken(token: string): Promise<any> {
      try {
          // In a real production OIDC setup, we would use a JWKS client to fetch
          // public keys from ${this.issuer}/protocol/openid-connect/certs
          // and verify the token signature using RS256.
          // For now, we allow HS256 with clientSecret or RS256 with a configured publicKey.
          const verificationKey = this.secretManager.getSecret('KEYCLOAK_PUBLIC_KEY', this.clientSecret);
          const audience = this.secretManager.getSecret('KEYCLOAK_AUDIENCE', 'virteex-api');

          // SECURITY: await verifyToken if we were using JwtTokenService,
          // but here we use jwt.verify directly.
          // In any case, we should align with JwtTokenService hardening if possible.
          return jwt.verify(token, verificationKey, {
              issuer: this.issuer,
              audience: audience,
              algorithms: ['HS256', 'RS256']
          });
      } catch (e: any) {
          this.logger.error(`Keycloak token verification failed: ${e.message}`);
          throw new UnauthorizedException('Invalid or expired Keycloak token');
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
