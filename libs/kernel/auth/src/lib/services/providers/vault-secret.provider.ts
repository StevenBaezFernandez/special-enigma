import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SecretProvider } from '../../interfaces/secret-provider.interface';
import axios from 'axios';

@Injectable()
export class VaultSecretProvider implements SecretProvider {
  private readonly logger = new Logger(VaultSecretProvider.name);
  private readonly vaultUrl: string | undefined;
  private readonly vaultToken: string | undefined;
  private secrets: Record<string, string> = {};

  constructor(private readonly configService: ConfigService) {
    this.vaultUrl = this.configService.get<string>('VAULT_URL');
    this.vaultToken = this.configService.get<string>('VAULT_TOKEN');
  }

  public async initialize() {
    if (!this.vaultUrl || !this.vaultToken) {
        return;
    }

    try {
        const response = await axios.get(`${this.vaultUrl}/v1/secret/data/virteex`, {
            headers: { 'X-Vault-Token': this.vaultToken }
        });
        this.secrets = response.data.data.data;
        this.logger.log('Vault secrets initialized successfully');
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to initialize Vault secrets: ${message}`);
    }
  }

  getSecret(key: string): string | null {
    return this.secrets[key] || null;
  }
}
