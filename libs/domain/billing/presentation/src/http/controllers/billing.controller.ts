import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '@virteex/shared-util-server-server-config';
import { CreateInvoiceUseCase, CreateInvoiceDto, GetInvoicesUseCase, GetPaymentHistoryUseCase, GetUsageUseCase } from '@virteex/domain-billing-application';
import { GetSubscriptionPlansUseCase } from '@virteex/domain-subscription-application';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly createInvoiceUseCase: CreateInvoiceUseCase,
    private readonly getInvoicesUseCase: GetInvoicesUseCase,
    private readonly getSubscriptionPlansUseCase: GetSubscriptionPlansUseCase,
    private readonly getPaymentHistoryUseCase: GetPaymentHistoryUseCase,
    private readonly getUsageUseCase: GetUsageUseCase
  ) {}

  @Post('invoices')
  async create(@Body() dto: CreateInvoiceDto, @CurrentTenant() tenantId: string) {
    dto.tenantId = tenantId;
    return await this.createInvoiceUseCase.execute(dto);
  }

  @Get('invoices')
  async findAll(@CurrentTenant() tenantId: string) {
    return await this.getInvoicesUseCase.execute(tenantId);
  }

  @Get('plans')
  async getPlans() {
    return await this.getSubscriptionPlansUseCase.execute();
  }

  @Get('history')
  async getHistory(@CurrentTenant() tenantId: string) {
    return await this.getPaymentHistoryUseCase.execute(tenantId);
  }

  @Get('usage')
  async getUsage(@CurrentTenant() tenantId: string) {
    return await this.getUsageUseCase.execute(tenantId);
  }
}
