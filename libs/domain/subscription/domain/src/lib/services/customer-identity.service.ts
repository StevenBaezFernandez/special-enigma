import { Injectable, Inject } from '@nestjs/common';
import { SubscriptionRepository, SUBSCRIPTION_REPOSITORY } from '../repositories/subscription.repository';
import { CustomerRegistryGateway, CUSTOMER_REGISTRY_GATEWAY } from '../ports/customer-registry.port';

@Injectable()
export class CustomerIdentityService {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(CUSTOMER_REGISTRY_GATEWAY)
    private readonly customerRegistryGateway: CustomerRegistryGateway
  ) {}

  async getOrCreateExternalId(email: string, name: string, paymentMethodId: string, tenantId: string): Promise<string> {
    const subscription = await this.subscriptionRepository.findByTenantId(tenantId);
    if (subscription?.externalCustomerId) {
      return subscription.externalCustomerId;
    }
    return await this.customerRegistryGateway.createCustomer(email, name, paymentMethodId);
  }
}
