import { Controller, Get, Param, Query, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@virteex/kernel-auth';
import { LocalizationConfigDto, TaxLookupDto, FiscalRegionDto } from '@virteex/domain-identity-contracts';
import { LocalizationPort } from '@virteex/domain-identity-domain';

@ApiTags('Localization')
@Controller('localization')
export class LocalizationController {
  constructor(
    @Inject(LocalizationPort) private readonly localizationService: LocalizationPort
  ) {}

  @Public()
  @Get('config/:code')
  @ApiOperation({ summary: 'Get regional configuration by country code' })
  @ApiResponse({ type: Object, description: 'LocalizationConfigDto' })
  async getConfig(@Param('code') code: string): Promise<LocalizationConfigDto> {
    return this.localizationService.getConfig(code);
  }

  @Public()
  @Get('lookup/:taxId')
  @ApiOperation({ summary: 'Lookup entity information by Tax ID' })
  @ApiResponse({ type: Object, description: 'TaxLookupDto' })
  async lookup(@Param('taxId') taxId: string, @Query('country') country: string): Promise<TaxLookupDto> {
    return this.localizationService.lookup(taxId, country);
  }

  @Public()
  @Get('fiscal-regions')
  @ApiOperation({ summary: 'Get available fiscal regions' })
  @ApiResponse({ type: [Object], description: 'FiscalRegionDto[]' })
  async getFiscalRegions(): Promise<FiscalRegionDto[]> {
    return this.localizationService.getFiscalRegions();
  }
}
