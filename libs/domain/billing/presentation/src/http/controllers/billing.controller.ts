import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentTenant } from '@virteex/shared-util-server-server-config';
import { CreateInvoiceUseCase, CreateInvoiceDto, GetInvoicesUseCase, GetPaymentHistoryUseCase, GetUsageUseCase } from '@virteex/domain-billing-application';
import { GetSubscriptionPlansUseCase, GetSubscriptionUseCase } from '@virteex/domain-subscription-application';
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
    private readonly getSubscriptionUseCase: GetSubscriptionUseCase,
    private readonly getPaymentHistoryUseCase: GetPaymentHistoryUseCase,
    private readonly getUsageUseCase: GetUsageUseCase
  ) {}

  @Post('invoices')
  @RequireEntitlement('invoices')
  async create(@Body() dto: CreateInvoiceDto, @CurrentTenant() tenantId: string) {
    dto.tenantId = tenantId;
    return await this.createInvoiceUseCase.execute(dto);
  }

  @Get('invoices')
  @RequireEntitlement('invoices')
  async findAll(@CurrentTenant() tenantId: string) {
    return await this.getInvoicesUseCase.execute(tenantId);
  }

  @Get('subscription')
  async getSubscription(@CurrentTenant() tenantId: string) {
    const subscription = await this.getSubscriptionUseCase.execute(tenantId);
    if (!subscription) {
        return {
            planName: 'Free',
            planId: 'free',
            status: 'INACTIVE',
            price: 0,
            billingCycle: 'monthly',
            nextBillingDate: new Date().toISOString()
        };
    }

    return {
        planName: subscription.getPlan().name,
        planId: subscription.getPlan().slug,
        status: subscription.getStatus(),
        price: parseFloat(subscription.getPlan().price),
        billingCycle: 'monthly',
        nextBillingDate: subscription.getCurrentPeriodEnd()?.toISOString() || new Date().toISOString()
    };
  }

  @Get('plans')
  async getPlans() {
    return await this.getSubscriptionPlansUseCase.execute();
  }

  @Get('history')
  @RequireEntitlement('invoices')
  async getHistory(@CurrentTenant() tenantId: string) {
    return await this.getPaymentHistoryUseCase.execute(tenantId);
  }

  @Get('usage')
  @RequireEntitlement('invoices')
  async getUsage(@CurrentTenant() tenantId: string) {
    return await this.getUsageUseCase.execute(tenantId);
  }
}
