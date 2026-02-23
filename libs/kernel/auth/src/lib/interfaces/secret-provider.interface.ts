export interface SecretProvider {
  /**
   * Retrieves a secret value by its key.
   * Should throw an error or return null if not found/available depending on implementation,
   * but generally should be robust.
   */
  getSecret(key: string): string | null;
}
