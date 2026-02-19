import { Injectable, Inject } from '@nestjs/common';
import { PaymentProvider } from '../../../../domain/src/lib/ports/payment-provider.port';

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject('PaymentProvider') private readonly paymentProvider: PaymentProvider
  ) {}

  async execute(amount: number, currency: string, source: string) {
    if (amount <= 0) {
      throw new Error('Invalid amount');
    }
    return this.paymentProvider.processPayment(amount, currency, source);
  }
}
