import { TaxProviderPort } from '@virteex/domain-identity-domain';
import { GenericTaxProvider } from './generic-tax-provider';
import { DominicanRepublicTaxProvider } from './dominican-republic-tax-provider';

export class TaxProviderFactory {
  static getProvider(countryCode: string): TaxProviderPort {
    switch (countryCode.toUpperCase()) {
      case 'DO':
        return new DominicanRepublicTaxProvider();
      default:
        return new GenericTaxProvider(countryCode.toUpperCase());
    }
  }
}
