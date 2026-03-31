import { Controller, Post, Body, Logger, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProcessPaymentUseCase } from '@virteex/domain-billing-application';
import { JwtAuthGuard, TenantGuard } from '@virteex/kernel-auth';

@ApiTags('Payment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly processPaymentUseCase: ProcessPaymentUseCase) {}

  @Post('checkout-session')
  async createCheckoutSession(@Body() body: any) {
    // Alignment with /payment/checkout-session
    return { url: 'https://checkout.stripe.com/...' };
  }

  @Post()
  async processPayment(@Body() body: { amount: number; currency: string; source: string }) {
    this.logger.log(`Received payment request: ${JSON.stringify(body)}`);
    return this.processPaymentUseCase.execute(body.amount, body.currency, body.source);
  }
}
