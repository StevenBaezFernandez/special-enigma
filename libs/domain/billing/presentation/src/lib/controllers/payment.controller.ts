import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ProcessPaymentUseCase } from '@virteex/domain-billing-application';

@Controller('billing/payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly processPaymentUseCase: ProcessPaymentUseCase) {}

  @Post()
  async processPayment(@Body() body: { amount: number; currency: string; source: string }) {
    this.logger.log(`Received payment request: ${JSON.stringify(body)}`);
    return this.processPaymentUseCase.execute(body.amount, body.currency, body.source);
  }
}
