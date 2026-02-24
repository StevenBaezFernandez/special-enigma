import { Injectable } from '@nestjs/common';
import { SecretProvider } from '../../interfaces/secret-provider.interface';

@Injectable()
export class CompositeSecretProvider implements SecretProvider {
  constructor(private readonly providers: SecretProvider[]) {}

  getSecret(key: string): string | null {
    for (const provider of this.providers) {
      const secret = provider.getSecret(key);
      if (secret) return secret;
    }
    return null;
  }
}
