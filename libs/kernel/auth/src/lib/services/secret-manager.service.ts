import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

@Injectable()
export class SecretManagerService {
  private readonly logger = new Logger(SecretManagerService.name);
  private currentSecret: string;
  private previousSecrets: string[] = [];

  constructor(private readonly configService: ConfigService) {
    try {
        this.currentSecret = this.loadSecret('JWT_SECRET');
    } catch (e: any) {
        this.logger.error(e.message);
        throw e;
    }

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

  private loadSecret(key: string): string {
    // 1. Try file (e.g. Docker Secret)
    const filePath = this.configService.get<string>(`${key}_FILE`);
    if (filePath && fs.existsSync(filePath)) {
        try {
            return fs.readFileSync(filePath, 'utf8').trim();
        } catch (e: any) {
            this.logger.error(`Failed to read secret from file ${filePath}: ${e.message}`);
        }
    }

    // 2. Try Env Var
    const envSecret = this.configService.get<string>(key);
    if (envSecret) {
        return envSecret;
    }

    // 3. Fail secure
    throw new Error(`${key} must be defined in environment variables (or via _FILE suffix). Application cannot start securely.`);
  }
}
