import { TaxLookupDto } from '@virteex/domain-identity-contracts';
import { TaxProviderPort } from '@virteex/domain-identity-domain';
import { Logger } from '@nestjs/common';

export class USTaxProvider implements TaxProviderPort {
  private readonly logger = new Logger(USTaxProvider.name);

  async lookup(taxId: string): Promise<TaxLookupDto> {
    this.logger.log(`Performing IRS lookup for EIN/SSN: ${taxId}`);

    // TODO: Integrate with IRS/3rd party real API
    return {
      taxId,
      country: 'US',
      name: '',
      isValid: false,
    };
  }

  getCountryCode(): string {
    return 'US';
  }
}
