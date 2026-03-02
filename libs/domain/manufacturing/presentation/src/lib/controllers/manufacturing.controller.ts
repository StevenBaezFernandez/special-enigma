import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateProductionOrderUseCase, GetProductionOrdersUseCase } from '@virteex/domain-manufacturing-application';
import { CreateProductionOrderDto } from '../dto/create-production-order.dto';
import { JwtAuthGuard } from '@virteex/kernel-auth';

@ApiTags('Manufacturing')
@Controller('manufacturing')
@UseGuards(JwtAuthGuard)
export class ManufacturingController {
  constructor(
    private readonly createUseCase: CreateProductionOrderUseCase,
    private readonly getUseCase: GetProductionOrdersUseCase
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  health() {
      return { status: 'ok', domain: 'Manufacturing' };
  }

  @Post('orders')
  @ApiOperation({ summary: 'Create Production Order' })
  create(@Body() dto: CreateProductionOrderDto) {
    return this.createUseCase.execute(dto);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get all Production Orders' })
  findAll() {
    return this.getUseCase.execute();
  }
}
