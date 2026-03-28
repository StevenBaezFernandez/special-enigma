import { TaxLookupDto } from '@virteex/domain-identity-contracts';
import { TaxProviderPort } from '@virteex/domain-identity-domain';

export class DominicanRepublicTaxProvider implements TaxProviderPort {
  async lookup(taxId: string): Promise<TaxLookupDto> {
    // Simulated DGII lookup
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
