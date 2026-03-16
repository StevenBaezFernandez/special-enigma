import { Injectable, Inject } from '@nestjs/common';
import { type PaymentProvider } from '@virteex/domain-billing-domain';

@Injectable()
export class CreateSubscriptionUseCase {
  constructor(
    @Inject('PaymentProvider') private readonly paymentProvider: any // Using any if interface doesn't yet have subscription methods
  ) {}

  async execute(customerId: string, priceId: string) {
    if (!this.paymentProvider.createSubscription) {
        throw new Error('Payment provider does not support subscriptions');
    }
    return this.paymentProvider.createSubscription(customerId, priceId);
  }
}
