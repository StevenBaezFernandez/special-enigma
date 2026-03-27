import { Injectable } from '@nestjs/common';
import { LocalizationConfigDto, TaxLookupDto, FiscalRegionDto } from '@virteex/domain-identity-contracts';
import { LocalizationPort } from '@virteex/domain-identity-domain';

@Injectable()
export class LocalizationService extends LocalizationPort {
  private readonly configs: Record<string, LocalizationConfigDto> = {
    'DO': { countryCode: 'DO', name: 'República Dominicana', currency: 'DOP', locale: 'es-DO', taxIdRegex: '^[0-9]{9,11}$', fiscalRegionId: 'DO-MAIN' },
    'MX': { countryCode: 'MX', name: 'México', currency: 'MXN', locale: 'es-MX', taxIdRegex: '^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$', fiscalRegionId: 'MX-FED' },
    'US': { countryCode: 'US', name: 'United States', currency: 'USD', locale: 'en-US', taxIdRegex: '^[0-9]{2}-[0-9]{7}$', fiscalRegionId: 'US-GEN' },
    'CO': { countryCode: 'CO', name: 'Colombia', currency: 'COP', locale: 'es-CO', taxIdRegex: '^[0-9]{9,10}-[0-9]$', fiscalRegionId: 'CO-GEN' },
    'PA': { countryCode: 'PA', name: 'Panamá', currency: 'PAB', locale: 'es-PA', taxIdRegex: '^[0-9A-Z\\-]+$', fiscalRegionId: 'PA-GEN' },
    'CR': { countryCode: 'CR', name: 'Costa Rica', currency: 'CRC', locale: 'es-CR', taxIdRegex: '^[0-9]{9,12}$', fiscalRegionId: 'CR-GEN' },
    'PE': { countryCode: 'PE', name: 'Perú', currency: 'PEN', locale: 'es-PE', taxIdRegex: '^[0-9]{11}$', fiscalRegionId: 'PE-GEN' },
    'CL': { countryCode: 'CL', name: 'Chile', currency: 'CLP', locale: 'es-CL', taxIdRegex: '^[0-9]{7,8}-[0-9Kk]$', fiscalRegionId: 'CL-GEN' },
  };

  private readonly fiscalRegions: FiscalRegionDto[] = [
    { id: 'DO-MAIN', name: 'República Dominicana - General' },
    { id: 'MX-FED', name: 'México - Federal' },
    { id: 'CO-GEN', name: 'Colombia - General' },
    { id: 'PA-GEN', name: 'Panamá - General' },
    { id: 'US-GEN', name: 'United States - General' },
    { id: 'CR-GEN', name: 'Costa Rica - General' },
    { id: 'PE-GEN', name: 'Perú - General' },
    { id: 'CL-GEN', name: 'Chile - General' }
  ];

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
    if (taxId.startsWith('000')) {
      return {
        taxId,
        country,
        name: '',
        isValid: false
      };
    }

    const config = this.configs[country.toUpperCase()];
    if (config && config.taxIdRegex) {
        const regex = new RegExp(config.taxIdRegex);
        if (!regex.test(taxId)) {
            return {
                taxId,
                country,
                name: '',
                isValid: false
            };
        }
    }

    return {
      taxId,
      country,
      name: `Empresa Simulada (${taxId})`,
      industry: 'Tecnología y Servicios',
      isValid: true
    };
  }

  async getFiscalRegions(): Promise<FiscalRegionDto[]> {
    return this.fiscalRegions;
  }
}
