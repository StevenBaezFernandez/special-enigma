import { TaxLookupDto } from '@virteex/domain-identity-contracts';
import { TaxProviderPort } from '@virteex/domain-identity-domain';
import { Logger } from '@nestjs/common';

export class DominicanRepublicTaxProvider implements TaxProviderPort {
  private readonly logger = new Logger(DominicanRepublicTaxProvider.name);

  async lookup(taxId: string): Promise<TaxLookupDto> {
    this.logger.log(`Performing DGII lookup for RNC: ${taxId}`);

    // TODO: Integrate with DGII real API
    // For now, we keep the simulation but with a clear TODO and more robust handling
    const companies: Record<string, any> = {
      '101010101': { legalName: 'VIRTEEX DOMINICANA SRL', industry: 'TECNOLOGIA', status: 'ACTIVO' },
      '202020202': { legalName: 'CONSTRUCCIONES S.A.', industry: 'CONSTRUCCION', status: 'ACTIVO' },
    };

    const found = companies[taxId];

    if (found) {
      return {
        taxId,
        country: 'DO',
        name: found.legalName,
        legalName: found.legalName,
        industry: found.industry,
        status: found.status,
        isValid: true,
      };
    }

    return {
      taxId,
      country: 'DO',
      name: '',
      isValid: false,
    };
  }

  getCountryCode(): string {
    return 'DO';
  }
}
