import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execFileSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { SecretProvider } from '../../interfaces/secret-provider.interface';

@Injectable()
export class KmsSecretProvider implements SecretProvider {
  private readonly logger = new Logger(KmsSecretProvider.name);
  private readonly nodeEnv: string;
  private readonly kmsRegion?: string;
  private readonly kmsKeyId?: string;
  private readonly requiredInProduction: boolean;
  private readonly decryptedSecrets: Record<string, string> = {};

  constructor(private readonly configService: ConfigService) {
    this.nodeEnv = this.configService.get<string>('NODE_ENV') ?? 'development';
    this.kmsRegion = this.configService.get<string>('AWS_REGION') ?? this.configService.get<string>('KMS_REGION');
    this.kmsKeyId = this.configService.get<string>('KMS_KEY_ID');
    this.requiredInProduction = this.configService.get<string>('KMS_REQUIRED_IN_PRODUCTION', 'true') === 'true';
  }

  async initialize(): Promise<void> {
    const configuredKeys = (this.configService.get<string>('KMS_SECRET_KEYS') ?? '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    if (configuredKeys.length === 0) {
      if (this.nodeEnv === 'production' && this.requiredInProduction) {
        throw new Error('KMS_SECRET_KEYS is required in production when KMS_REQUIRED_IN_PRODUCTION=true.');
      }
      return;
    }

    if (!this.kmsRegion) {
      throw new Error('AWS_REGION (or KMS_REGION) is required when KMS_SECRET_KEYS is configured.');
    }

    for (const key of configuredKeys) {
      const ciphertext = this.configService.get<string>(`${key}_KMS`) ?? process.env[`${key}_KMS`];
      if (!ciphertext) {
        if (this.nodeEnv === 'production') {
          throw new Error(`Encrypted secret ${key}_KMS is required in production.`);
        }
        this.logger.warn(`Skipping KMS key ${key} because ${key}_KMS is not configured.`);
        continue;
      }

      const cipherPath = this.writeCipherToTemp(key, ciphertext);
      try {
        const args = [
          'kms',
          'decrypt',
          '--region',
          this.kmsRegion,
          '--ciphertext-blob',
          `fileb://${cipherPath}`,
          '--output',
          'text',
          '--query',
          'Plaintext'
        ];

        if (this.kmsKeyId) {
          args.push('--key-id', this.kmsKeyId);
        }

        const output = execFileSync('aws', args, {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe']
        }).trim();

        const plaintext = Buffer.from(output, 'base64').toString('utf8');
        if (!plaintext) {
          throw new Error('KMS response returned empty plaintext.');
        }
        this.decryptedSecrets[key] = plaintext;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to decrypt ${key} with KMS: ${message}`);
        if (this.nodeEnv === 'production') {
          throw new Error(`KMS decrypt failed for ${key}.`);
        }
      } finally {
        try {
          unlinkSync(cipherPath);
        } catch {
          // no-op cleanup
        }
      }
    }
  }

  getSecret(key: string): string | null {
    return this.decryptedSecrets[key] ?? null;
  }

  private writeCipherToTemp(key: string, ciphertext: string): string {
    const path = `/tmp/virteex-kms-${key}-${process.pid}.bin`;
    writeFileSync(path, Buffer.from(ciphertext, 'base64'));
    return path;
  }
}
