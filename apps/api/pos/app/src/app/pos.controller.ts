import { Controller, Post, Get, Body, Param, Headers, UseGuards } from '@nestjs/common';
import { ProcessSaleUseCase } from '@virteex/domain-pos-application';
import { OpenShiftUseCase } from '@virteex/domain-pos-application';
import { StepUp, StepUpGuard } from '@virteex/kernel-auth';

@Controller('pos')
export class PosController {
  constructor(
    private readonly processSaleUseCase: ProcessSaleUseCase,
    private readonly openShiftUseCase: OpenShiftUseCase
  ) {}

  @Post('sales')
  async processSale(@Headers('x-virteex-tenant-id') tenantId: string, @Body() saleData: any) {
    return this.processSaleUseCase.execute(tenantId, saleData.terminalId, saleData);
  }

  @Post('shifts/open')
  @UseGuards(StepUpGuard)
  @StepUp({ action: 'tenant-admin', maxAgeSeconds: 600 })
  async openShift(@Headers('x-virteex-tenant-id') tenantId: string, @Body() shiftData: any) {
    return this.openShiftUseCase.execute(tenantId, shiftData.terminalId, shiftData.userId, shiftData.openingBalance);
  }
}
