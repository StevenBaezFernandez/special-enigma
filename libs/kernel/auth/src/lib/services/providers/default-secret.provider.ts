import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { SecretProvider } from '../../interfaces/secret-provider.interface';

@Injectable()
export class DefaultSecretProvider implements SecretProvider {
  private readonly logger = new Logger(DefaultSecretProvider.name);

  constructor(private readonly configService: ConfigService) {}

  getSecret(key: string): string | null {
    // 1. Try file (e.g. Docker Secret)
    const filePath = this.configService.get<string>(`${key}_FILE`);
    if (filePath && fs.existsSync(filePath)) {
      try {
        return fs.readFileSync(filePath, 'utf8').trim();
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        this.logger.error(`Failed to read secret from file ${filePath}: ${message}`);
      }
    }

    // 2. Try Env Var
    const envSecret = this.configService.get<string>(key);
    if (envSecret) {
      return envSecret;
    }

    return null;
  }
}
