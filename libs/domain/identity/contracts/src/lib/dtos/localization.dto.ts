export interface LocalizationConfigDto {
  countryCode: string;
  name: string;
  currency: string;
  locale: string;
  taxIdRegex: string;
  fiscalRegionId: string;
}

export interface TaxLookupDto {
  taxId: string;
  country: string;
  name: string;
  isValid: boolean;
}

export interface FiscalRegionDto {
  id: string;
  name: string;
}
