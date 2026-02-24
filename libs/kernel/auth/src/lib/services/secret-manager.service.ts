import { Injectable, Logger, Inject } from '@nestjs/common';
import { SecretProvider } from '../interfaces/secret-provider.interface';

export const SECRET_PROVIDER = 'SECRET_PROVIDER';

@Injectable()
export class SecretManagerService {
  private readonly logger = new Logger(SecretManagerService.name);
  private currentSecret!: string;
  private previousSecrets: string[] = [];

  constructor(
    @Inject(SECRET_PROVIDER) private readonly provider: SecretProvider
  ) {
    this.initSecrets();
  }

  private initSecrets() {
    try {
        const secret = this.provider.getSecret('JWT_SECRET');
        const isProd = process.env['NODE_ENV'] === 'production';

        if (!secret) {
            if (isProd) {
                throw new Error('JWT_SECRET not found in production environment!');
            }
            this.currentSecret = 'dev-secret-change-me-in-production';
            this.logger.warn('JWT_SECRET not found, using insecure development secret!');
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
    if (!value) {
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
  }
}
