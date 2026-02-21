import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecretManagerService {
  private readonly logger = new Logger(SecretManagerService.name);
  private currentSecret: string;
  private previousSecrets: string[] = [];

  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
        // Critical security check
        throw new Error('JWT_SECRET must be defined in environment variables. Application cannot start securely.');
    }
    this.currentSecret = secret;

    const rotation = this.configService.get<string>('JWT_SECRET_ROTATION');
    if (rotation) {
        this.previousSecrets = rotation.split(',');
    }
  }

  getJwtSecret(): string {
    return this.currentSecret;
  }

  getJwtVerificationSecrets(): string[] {
    return [this.currentSecret, ...this.previousSecrets];
  }

  // Example of rotation trigger (would be called by a scheduler or webhook)
  async rotateSecret(): Promise<void> {
      // Logic to fetch new secret from Vault
      this.logger.log('Rotating secrets...');
  }
}
