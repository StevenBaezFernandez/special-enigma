import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  AddPaymentMethodUseCase,
  AddPaymentMethodDto,
  GetPaymentMethodUseCase
} from '../../../../application/src/index';

@ApiTags('Billing')
@Controller('billing/payment-methods')
export class PaymentMethodController {
  constructor(
    private readonly addPaymentMethodUseCase: AddPaymentMethodUseCase,
    private readonly getPaymentMethodUseCase: GetPaymentMethodUseCase
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add a payment method' })
  async create(@Body() dto: AddPaymentMethodDto) {
    return await this.addPaymentMethodUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get payment methods by tenant' })
  async findAll(@Query('tenantId') tenantId: string) {
    const tid = tenantId || 'default-tenant';
    return await this.getPaymentMethodUseCase.execute(tid);
  }
}
