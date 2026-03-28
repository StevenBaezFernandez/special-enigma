import { TaxLookupDto } from '@virteex/domain-identity-contracts';
import { TaxProviderPort } from '@virteex/domain-identity-domain';

export class GenericTaxProvider implements TaxProviderPort {
  constructor(private readonly countryCode: string) {}

  async lookup(taxId: string): Promise<TaxLookupDto> {
    // Basic implementation that just returns valid if called
    // In a real world, this could call a generic international tax API
    return {
      taxId,
      country: this.countryCode,
      name: '',
      isValid: true,
    };
  }

  getCountryCode(): string {
    return this.countryCode;
  }
}
