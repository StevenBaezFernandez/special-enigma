import { Injectable, Inject } from '@nestjs/common';
import { SubscriptionRepository, SUBSCRIPTION_REPOSITORY } from '../repositories/subscription.repository';
import { SubscriptionGateway, SUBSCRIPTION_GATEWAY } from '../ports/subscription-gateway.port';

@Injectable()
export class CustomerManagementService {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(SUBSCRIPTION_GATEWAY)
    private readonly subscriptionGateway: SubscriptionGateway
  ) {}

  async getOrCreateCustomerId(email: string, name: string, paymentMethodId: string, tenantId: string): Promise<string> {
    const subscription = await this.subscriptionRepository.findByTenantId(tenantId);
    if (subscription?.stripeCustomerId) {
      return subscription.stripeCustomerId;
    }
    return await this.subscriptionGateway.createCustomer(email, name, paymentMethodId);
  }
}
