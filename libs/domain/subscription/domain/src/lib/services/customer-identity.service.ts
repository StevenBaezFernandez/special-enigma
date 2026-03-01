import { SubscriptionRepository, SUBSCRIPTION_REPOSITORY } from '../repositories/subscription.repository';
import { CustomerRegistryGateway, CUSTOMER_REGISTRY_GATEWAY } from '../ports/customer-registry.port';

export class CustomerIdentityService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
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
