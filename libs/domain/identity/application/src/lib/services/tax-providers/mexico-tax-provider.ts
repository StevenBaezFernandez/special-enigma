import { TaxLookupDto } from '@virteex/domain-identity-contracts';
import { TaxProviderPort } from '@virteex/domain-identity-domain';
import { Logger } from '@nestjs/common';

export class MexicoTaxProvider implements TaxProviderPort {
  private readonly logger = new Logger(MexicoTaxProvider.name);

  async lookup(taxId: string): Promise<TaxLookupDto> {
    this.logger.log(`Performing SAT lookup for RFC: ${taxId}`);

    // TODO: Integrate with SAT real API
    return {
      taxId,
      country: 'MX',
      name: '',
      isValid: false,
    };
  }

  getCountryCode(): string {
    return 'MX';
  }
}
