import { Injectable, Inject } from '@nestjs/common';
import { type PaymentProvider, PAYMENT_PROVIDER } from '@virteex/domain-billing-domain';

@Injectable()
export class CreateCheckoutSessionUseCase {
  constructor(
    @Inject(PAYMENT_PROVIDER) private readonly paymentProvider: PaymentProvider
  ) {}

  async execute(planId: string, tenantId: string): Promise<{ url: string }> {
    if (!planId || !tenantId) {
      throw new Error('Plan ID and Tenant ID are required');
    }

    // In a real implementation, we would validate that the plan exists
    // and check if the tenant is eligible for the upgrade/change.

    return await this.paymentProvider.createCheckoutSession(planId, tenantId);
  }
}
