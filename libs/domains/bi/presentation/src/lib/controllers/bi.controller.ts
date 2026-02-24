import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  GenerateReportUseCase,
  GenerateReportDto,
  GetTopProductsUseCase,
  GetInvoiceStatusUseCase,
  GetArAgingUseCase,
  GetExpensesUseCase
} from '@virteex/application-bi-application';

@ApiTags('BI')
@Controller('bi')
export class BiController {
  constructor(
    private readonly generateUseCase: GenerateReportUseCase,
    private readonly getTopProductsUseCase: GetTopProductsUseCase,
    private readonly getInvoiceStatusUseCase: GetInvoiceStatusUseCase,
    private readonly getArAgingUseCase: GetArAgingUseCase,
    private readonly getExpensesUseCase: GetExpensesUseCase
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  health() {
      return { status: 'ok', domain: 'BI' };
  }

  @Post('reports')
  @ApiOperation({ summary: 'Generate Report' })
  generate(@Body() dto: GenerateReportDto) {
    return this.generateUseCase.execute(dto);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Get Top Products' })
  getTopProducts(@Query('tenantId') tenantId: string) {
    return this.getTopProductsUseCase.execute(tenantId || 'default');
  }

  @Get('invoice-status')
  @ApiOperation({ summary: 'Get Invoice Status Summary' })
  getInvoiceStatus(@Query('tenantId') tenantId: string) {
    return this.getInvoiceStatusUseCase.execute(tenantId || 'default');
  }

  @Get('ar-aging')
  @ApiOperation({ summary: 'Get AR Aging' })
  getArAging(@Query('tenantId') tenantId: string) {
    return this.getArAgingUseCase.execute(tenantId || 'default');
  }

  @Get('expenses')
  @ApiOperation({ summary: 'Get Expenses Breakdown' })
  getExpenses(@Query('tenantId') tenantId: string) {
    return this.getExpensesUseCase.execute(tenantId || 'default');
  }
}
