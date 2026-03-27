import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@virteex/kernel-auth';

@ApiTags('Localization')
@Controller('localization')
export class LocalizationController {

  @Public()
  @Get('config/:code')
  @ApiOperation({ summary: 'Get regional configuration by country code' })
  async getConfig(@Param('code') code: string) {
    // Basic mock implementation based on frontend expectations
    const configs: Record<string, any> = {
      'DO': { currencyCode: 'DOP', taxIdRegex: '^[0-9]{9,11}$', fiscalRegionId: 'DO-MAIN' },
      'MX': { currencyCode: 'MXN', taxIdRegex: '^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$', fiscalRegionId: 'MX-FED' },
      'US': { currencyCode: 'USD', taxIdRegex: '^[0-9]{2}-[0-9]{7}$', fiscalRegionId: 'US-GEN' },
    };
    return configs[code.toUpperCase()] || { currencyCode: 'USD', taxIdRegex: '^[A-Za-z0-9\\-\\s]+$' };
  }

  @Public()
  @Get('lookup/:taxId')
  @ApiOperation({ summary: 'Lookup entity information by Tax ID' })
  async lookup(@Param('taxId') taxId: string, @Query('country') country: string) {
    return {
      taxId,
      country,
      name: 'Mock Entity Name',
      isValid: true
    };
  }

  @Public()
  @Get('fiscal-regions')
  @ApiOperation({ summary: 'Get available fiscal regions' })
  async getFiscalRegions() {
    return [
      { id: 'DO-MAIN', name: 'República Dominicana - General' },
      { id: 'MX-FED', name: 'México - Federal' },
      { id: 'CO-GEN', name: 'Colombia - General' },
      { id: 'PA-GEN', name: 'Panamá - General' },
      { id: 'US-GEN', name: 'United States - General' }
    ];
  }
}
