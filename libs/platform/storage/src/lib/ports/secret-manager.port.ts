export interface SecretManager {
  getSecret<T>(secretId: string): Promise<T>;
  updateSecret(secretId: string, value: string): Promise<void>;
  listSecrets(): Promise<string[]>;
}

export const SECRET_MANAGER = Symbol('SECRET_MANAGER');
