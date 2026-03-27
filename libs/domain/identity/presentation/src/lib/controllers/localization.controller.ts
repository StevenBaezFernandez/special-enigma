import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@virteex/kernel-auth';
import { LocalizationConfigDto, TaxLookupDto, FiscalRegionDto } from '@virteex/domain-identity-contracts';

@ApiTags('Localization')
@Controller('localization')
export class LocalizationController {
  private readonly configs: Record<string, LocalizationConfigDto> = {
    'DO': { countryCode: 'DO', name: 'República Dominicana', currency: 'DOP', locale: 'es-DO', taxIdRegex: '^[0-9]{9,11}$', fiscalRegionId: 'DO-MAIN' },
    'MX': { countryCode: 'MX', name: 'México', currency: 'MXN', locale: 'es-MX', taxIdRegex: '^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$', fiscalRegionId: 'MX-FED' },
    'US': { countryCode: 'US', name: 'United States', currency: 'USD', locale: 'en-US', taxIdRegex: '^[0-9]{2}-[0-9]{7}$', fiscalRegionId: 'US-GEN' },
  };

  private readonly fiscalRegions: FiscalRegionDto[] = [
    { id: 'DO-MAIN', name: 'República Dominicana - General' },
    { id: 'MX-FED', name: 'México - Federal' },
    { id: 'CO-GEN', name: 'Colombia - General' },
    { id: 'PA-GEN', name: 'Panamá - General' },
    { id: 'US-GEN', name: 'United States - General' }
  ];

  @Public()
  @Get('config/:code')
  @ApiOperation({ summary: 'Get regional configuration by country code' })
  @ApiResponse({ type: Object, description: 'LocalizationConfigDto' })
  async getConfig(@Param('code') code: string): Promise<LocalizationConfigDto> {
    return this.configs[code.toUpperCase()] || {
        countryCode: code.toUpperCase(),
        name: code.toUpperCase(),
        currency: 'USD',
        locale: 'en-US',
        taxIdRegex: '^[A-Za-z0-9\\-\\s]+$',
        fiscalRegionId: 'GEN'
    };
  }

  @Public()
  @Get('lookup/:taxId')
  @ApiOperation({ summary: 'Lookup entity information by Tax ID' })
  @ApiResponse({ type: Object, description: 'TaxLookupDto' })
  async lookup(@Param('taxId') taxId: string, @Query('country') country: string): Promise<TaxLookupDto> {
    return {
      taxId,
      country,
      name: `Entity for ${taxId} in ${country}`,
      isValid: true
    };
  }

  @Public()
  @Get('fiscal-regions')
  @ApiOperation({ summary: 'Get available fiscal regions' })
  @ApiResponse({ type: [Object], description: 'FiscalRegionDto[]' })
  async getFiscalRegions(): Promise<FiscalRegionDto[]> {
    return this.fiscalRegions;
  }
}
