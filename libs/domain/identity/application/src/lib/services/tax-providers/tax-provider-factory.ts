import { TaxProviderPort } from '@virteex/domain-identity-domain';
import { GenericTaxProvider } from './generic-tax-provider';
import { DominicanRepublicTaxProvider } from './dominican-republic-tax-provider';
import { MexicoTaxProvider } from './mexico-tax-provider';
import { USTaxProvider } from './us-tax-provider';

export class TaxProviderFactory {
  static getProvider(countryCode: string): TaxProviderPort {
    switch (countryCode.toUpperCase()) {
      case 'DO':
        return new DominicanRepublicTaxProvider();
      case 'MX':
        return new MexicoTaxProvider();
      case 'US':
        return new USTaxProvider();
      default:
        return new GenericTaxProvider(countryCode.toUpperCase());
    }
  }
}
