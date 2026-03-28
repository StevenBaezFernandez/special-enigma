import { Injectable } from '@nestjs/common';
import { LocalizationConfigDto, TaxLookupDto, FiscalRegionDto } from '@virteex/domain-identity-contracts';
import { LocalizationPort } from '@virteex/domain-identity-domain';
import * as countries from './countries.json';
import { TaxProviderFactory } from './tax-providers/tax-provider-factory';

@Injectable()
export class LocalizationService extends LocalizationPort {
  private readonly configs: Record<string, LocalizationConfigDto> = countries;

  async getConfig(code: string): Promise<LocalizationConfigDto> {
    return this.configs[code.toUpperCase()] || {
        countryCode: code.toUpperCase(),
        name: code.toUpperCase(),
        currency: 'USD',
        locale: 'en-US',
        taxIdRegex: '^[A-Za-z0-9\\-\\s]+$',
        fiscalRegionId: 'GEN'
    };
  }

  async lookup(taxId: string, country: string): Promise<TaxLookupDto> {
    const config = this.configs[country.toUpperCase()];

    // 1. Basic format validation
    if (taxId.startsWith('000')) {
      return { taxId, country, name: '', isValid: false };
    }

    if (config && config.taxIdRegex) {
        const regex = new RegExp(config.taxIdRegex);
        if (!regex.test(taxId)) {
            return { taxId, country, name: '', isValid: false };
        }
    }

    // 2. Business lookup through specific providers
    try {
        const provider = TaxProviderFactory.getProvider(country);
        const result = await provider.lookup(taxId);

        // Ensure name is present for backward compatibility
        if (result.isValid && !result.name && result.legalName) {
            result.name = result.legalName;
        }

        return result;
    } catch (error) {
        console.error(`[LocalizationService] Error performing tax lookup for ${country}:`, error);

        // Fallback for unexpected provider errors if it passed regex
        return {
            taxId,
            country,
            name: '',
            isValid: true // We assume it's valid if regex passed but provider failed
        };
    }
  }
}
