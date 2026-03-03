import { Injectable, Logger } from '@nestjs/common';
import { SecretManager } from '../ports/secret-manager.port';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
  UpdateSecretCommand,
  ListSecretsCommand,
} from '@aws-sdk/client-secrets-manager';

/**
 * AWS Secret Manager Adapter - Real implementation using @aws-sdk/client-secrets-manager.
 * No longer uses insecure fallbacks in production.
 */
@Injectable()
export class AwsSecretManagerAdapter implements SecretManager {
  private readonly logger = new Logger(AwsSecretManagerAdapter.name);
  private client: SecretsManagerClient | null = null;

  constructor() {
    this.logger.log('Initializing AWS Secret Manager Adapter (Cloud Native Strategy)');
    const isProduction = process.env['NODE_ENV'] === 'production' || process.env['RELEASE_STAGE'] === 'production';

    if (isProduction || process.env['FORCE_AWS_SECRETS'] === 'true') {
      this.client = new SecretsManagerClient({
        region: process.env['AWS_REGION'] || 'us-east-1',
      });
    }
  }

  async getSecret<T>(secretId: string): Promise<T> {
    this.logger.log(`Fetching secret ${secretId} from AWS Secrets Manager...`);

    const isProduction = process.env['NODE_ENV'] === 'production' || process.env['RELEASE_STAGE'] === 'production';
    const forceAws = process.env['FORCE_AWS_SECRETS'] === 'true';

    if (!isProduction && !forceAws) {
      this.logger.warn(`Development mode: local context might be used for ${secretId}`);
      // Fallback logic for development environments only.
      // In production, the client must be initialized.
    }

    if (!this.client) {
      throw new Error(`AWS Secret Manager Client not initialized. Refusing to serve non-production secrets for ${secretId} in production.`);
    }

    try {
      const command = new GetSecretValueCommand({ SecretId: secretId });
      const response = await this.client.send(command);

      if (response.SecretString) {
        try {
          return JSON.parse(response.SecretString) as T;
        } catch (e) {
          return response.SecretString as unknown as T;
        }
      }

      throw new Error(`Secret ${secretId} has no SecretString value.`);
    } catch (error: any) {
      this.logger.error(`Failed to fetch secret ${secretId}: ${error.message}`);
      throw new Error(`AWS Secrets Manager integration failed for ${secretId}: ${error.message}`);
    }
  }

  async updateSecret(secretId: string, value: string): Promise<void> {
    this.logger.warn(`UPDATING secret ${secretId} in AWS Secrets Manager. Triggering rotation...`);
    if (!this.client) {
        throw new Error('AWS Client not initialized for secret updates.');
    }
    try {
      const command = new UpdateSecretCommand({
        SecretId: secretId,
        SecretString: value,
      });
      await this.client.send(command);
    } catch (error: any) {
      this.logger.error(`Failed to update secret ${secretId}: ${error.message}`);
      throw error;
    }
  }

  async listSecrets(): Promise<string[]> {
    if (!this.client) return [];
    try {
      const command = new ListSecretsCommand({});
      const response = await this.client.send(command);
      return response.SecretList?.map((s) => s.Name || '') || [];
    } catch (error: any) {
      this.logger.error(`Failed to list secrets: ${error.message}`);
      return [];
    }
  }
}
