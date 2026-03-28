import { TaxLookupDto } from '@virteex/domain-identity-contracts';
import { TaxProviderPort } from '@virteex/domain-identity-domain';

export class GenericTaxProvider implements TaxProviderPort {
  constructor(private readonly countryCode: string) {}

  async lookup(taxId: string): Promise<TaxLookupDto> {
    // Basic implementation that just returns invalid by default
    // Generic provider doesn't have real verification logic
    return {
      taxId,
      country: this.countryCode,
      name: '',
      isValid: false,
    };
  }

  getCountryCode(): string {
    return this.countryCode;
  }
}
