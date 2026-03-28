import { Injectable, Inject } from '@nestjs/common';
import { type PaymentProvider, PAYMENT_PROVIDER } from '@virteex/domain-billing-domain';

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject(PAYMENT_PROVIDER) private readonly paymentProvider: PaymentProvider
  ) {}

  async execute(amount: number, currency: string, source: string) {
    if (amount <= 0) {
      throw new Error('Invalid amount');
    }
    return this.paymentProvider.processPayment(amount, currency, source);
  }
}
