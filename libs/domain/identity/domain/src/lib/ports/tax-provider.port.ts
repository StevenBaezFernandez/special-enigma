import { TaxLookupDto } from '@virteex/domain-identity-contracts';

export interface TaxProviderPort {
  lookup(taxId: string): Promise<TaxLookupDto>;
  getCountryCode(): string;
}

export const TAX_PROVIDER_PORT = 'TAX_PROVIDER_PORT';
