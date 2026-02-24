import { Injectable, Inject } from '@nestjs/common';
import { Subscription, SubscriptionRepository, SUBSCRIPTION_REPOSITORY } from '@virteex/domain-subscription-domain';

@Injectable()
export class GetSubscriptionUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository
  ) {}

  async execute(tenantId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findByTenantId(tenantId);
  }
}
