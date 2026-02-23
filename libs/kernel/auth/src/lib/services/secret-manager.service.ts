import { Injectable, Logger, Inject } from '@nestjs/common';
import { SecretProvider } from '../interfaces/secret-provider.interface';

export const SECRET_PROVIDER = 'SECRET_PROVIDER';

@Injectable()
export class SecretManagerService {
  private readonly logger = new Logger(SecretManagerService.name);
  private currentSecret: string;
  private previousSecrets: string[] = [];

  constructor(
    @Inject(SECRET_PROVIDER) private readonly provider: SecretProvider
  ) {
    this.initSecrets();
  }

  private initSecrets() {
    try {
        const secret = this.provider.getSecret('JWT_SECRET');
        if (!secret) {
             throw new Error('JWT_SECRET must be defined in environment variables (or via _FILE suffix). Application cannot start securely.');
        }
        this.currentSecret = secret;
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

  getSecret(key: string): string {
    const value = this.provider.getSecret(key);
    if (!value) {
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

  // Example of rotation trigger (would be called by a scheduler or webhook)
  async rotateSecret(): Promise<void> {
      // Logic to re-fetch secrets could go here, potentially calling initSecrets again
      this.logger.log('Rotating secrets...');
      // In a real implementation, this would fetch new secrets from the provider.
      // this.initSecrets();
  }
}
