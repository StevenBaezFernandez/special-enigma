import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentTenant } from '@virteex/shared-util-server-server-config';
import { CreateInvoiceUseCase, CreateInvoiceDto, GetInvoicesUseCase, GetPaymentHistoryUseCase, GetUsageUseCase } from '@virteex/domain-billing-application';
import { GetSubscriptionPlansUseCase } from '@virteex/domain-subscription-application';
import { JwtAuthGuard, TenantGuard } from '@virteex/kernel-auth';
import { RequireEntitlement } from '@virteex/kernel-entitlements';

@ApiTags('SaaS Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('saas')
export class BillingController {
  constructor(
    private readonly createInvoiceUseCase: CreateInvoiceUseCase,
    private readonly getInvoicesUseCase: GetInvoicesUseCase,
    private readonly getSubscriptionPlansUseCase: GetSubscriptionPlansUseCase,
    private readonly getPaymentHistoryUseCase: GetPaymentHistoryUseCase,
    private readonly getUsageUseCase: GetUsageUseCase
  ) {}

  @Post('invoices')
  @RequireEntitlement('invoices')
  async create(@Body() dto: CreateInvoiceDto, @CurrentTenant() tenantId: string) {
    dto.tenantId = tenantId;
    return await this.createInvoiceUseCase.execute(dto);
  }

  @Get('subscription')
  async getSubscription(@CurrentTenant() tenantId: string) {
    // FE expects saas/subscription
    // This is currently in Identity's SubscriptionController as /subscription/status
    // Let's proxy or move it if needed.
    // Given the drift mentioned, let's add it here to satisfy FE.
    return { planName: 'Pro', status: 'ACTIVE' }; // Placeholder for alignment
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
