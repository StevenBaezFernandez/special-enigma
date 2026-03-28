import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CurrentTenant, DomainException } from '@virteex/shared-util-server-server-config';
import { StepUp, StepUpGuard } from '@virteex/kernel-auth';
import { AddPaymentMethodUseCase, type AddPaymentMethodDto, GetPaymentMethodUseCase } from '@virteex/domain-billing-application';

@ApiTags('Billing')
@Controller('billing/payment-methods')
export class PaymentMethodController {
  constructor(
    private readonly addPaymentMethodUseCase: AddPaymentMethodUseCase,
    private readonly getPaymentMethodUseCase: GetPaymentMethodUseCase
  ) {}

  @Post()
  @UseGuards(StepUpGuard)
  @StepUp({ action: 'credentials-change', maxAgeSeconds: 300 })
  @ApiOperation({ summary: 'Add a payment method' })
  async create(@Body() dto: AddPaymentMethodDto) {
    return await this.addPaymentMethodUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get payment methods by tenant' })
  async findAll(@CurrentTenant() tenantId: string) {
    if (!tenantId) {
      throw new DomainException('Tenant ID is required', 'TENANT_REQUIRED');
    }
    return await this.getPaymentMethodUseCase.execute(tenantId);
  }
}
