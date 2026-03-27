import { LocalizationConfigDto, TaxLookupDto, FiscalRegionDto } from '@virteex/domain-identity-contracts';

export abstract class LocalizationPort {
  abstract getConfig(code: string): Promise<LocalizationConfigDto>;
  abstract lookup(taxId: string, country: string): Promise<TaxLookupDto>;
  abstract getFiscalRegions(): Promise<FiscalRegionDto[]>;
}

export const LOCALIZATION_PORT = 'LOCALIZATION_PORT';
