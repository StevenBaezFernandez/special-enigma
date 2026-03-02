import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateFixedAssetUseCase, CreateFixedAssetDto, GetFixedAssetsUseCase } from '@virteex/domain-fixed-assets-application';

@ApiTags('Fixed Assets')
@Controller('fixed-assets')
export class FixedAssetsController {
  constructor(
    private readonly createUseCase: CreateFixedAssetUseCase,
    private readonly getUseCase: GetFixedAssetsUseCase
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  health() {
      return { status: 'ok', domain: 'FixedAssets' };
  }

  @Post()
  @ApiOperation({ summary: 'Create Fixed Asset' })
  create(@Body() dto: CreateFixedAssetDto) {
    return this.createUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Fixed Assets' })
  findAll() {
    return this.getUseCase.execute();
  }
}
