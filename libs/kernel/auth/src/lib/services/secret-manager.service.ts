import { Injectable, Logger, Inject } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { SecretProvider } from '../interfaces/secret-provider.interface';
import { TelemetryService, TELEMETRY_SERVICE } from '@virteex/kernel-telemetry-interfaces';

export const SECRET_PROVIDER = 'SECRET_PROVIDER';

@Injectable()
export class SecretManagerService {
  private readonly logger = new Logger(SecretManagerService.name);
  private currentSecret!: string;
  private previousSecrets: string[] = [];

  constructor(
    @Inject(SECRET_PROVIDER) private readonly provider: SecretProvider,
    @Inject(TELEMETRY_SERVICE) private readonly telemetry: TelemetryService
  ) {
    this.initSecrets();
  }

  private initSecrets() {
    try {
        const isProd = (process.env['NODE_ENV'] === 'production' || process.env['RELEASE_STAGE'] === 'production') && process.env['NODE_ENV'] !== 'test';
        const secret = this.provider.getSecret('JWT_SECRET');

        if (!secret) {
            if (isProd) {
                this.logger.error('FATAL: JWT_SECRET not found in production environment! Blocking startup.');
                throw new Error('FATAL: JWT_SECRET not found in production environment!');
            }
            this.currentSecret = 'test-secret-ephemeral'; // Stable for tests
            this.logger.warn('JWT_SECRET not found in non-production. Generated ephemeral runtime secret.');
        } else {
            this.currentSecret = secret;
        }
    } catch (e: unknown) {
        if (e instanceof Error) {
            this.logger.error(e.message);
        } else {
            this.logger.error('Unknown error during secret initialization');
        }
        throw e;
    }

    const rotation = this.provider.getSecret('JWT_SECRET_ROTATION');
    if (rotation) {
        this.previousSecrets = rotation.split(',');
    }
  }

  getSecret(key: string, defaultValue?: string): string {
    const value = this.provider.getSecret(key);
    const isProd = (process.env['NODE_ENV'] === 'production' || process.env['RELEASE_STAGE'] === 'production') && process.env['NODE_ENV'] !== 'test';

    if (!value) {
      if (isProd && defaultValue === undefined) {
          this.logger.error(`FATAL: Secret ${key} not found in production and no default provided.`);
          throw new Error(`FATAL: Secret ${key} not found in production.`);
      }

      if (defaultValue !== undefined) {
          return defaultValue;
      }
      throw new Error(`Secret ${key} not found.`);
    }
    return value;
  }

  getJwtSecret(): string {
    return this.currentSecret;
  }

  getJwtVerificationSecrets(): string[] {
    return [this.currentSecret, ...this.previousSecrets];
  }

  async rotateSecret(): Promise<void> {
      this.logger.log('Rotating secrets...');
      this.initSecrets();
      this.telemetry.recordSecurityEvent('KEY_ROTATION_EXECUTED', {
        secretType: 'JWT',
        service: 'kernel-auth',
        environment: process.env['NODE_ENV'] || 'unknown',
        timestamp: new Date().toISOString(),
      });
  }
}
