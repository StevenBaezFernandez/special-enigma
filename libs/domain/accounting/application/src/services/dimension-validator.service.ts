import { InvalidDimensionKeyError } from '@virteex/domain-accounting-domain';

export class DimensionValidator {
  private readonly keyRegex = /^[a-zA-Z0-9_]+$/;

  validateKey(key: string): boolean {
    return this.keyRegex.test(key);
  }

  ensureValidKey(key: string): void {
    if (!this.validateKey(key)) {
      throw new InvalidDimensionKeyError(key);
    }
  }
}
