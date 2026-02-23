import { Injectable, Inject } from '@nestjs/common';
import {
  SubscriptionStatus,
  SubscriptionRepository,
  SUBSCRIPTION_REPOSITORY,
} from '@virteex/subscription-domain';

export interface HandleSubscriptionDeletedDto {
  subscriptionId: string;
}

@Injectable()
export class HandleSubscriptionDeletedUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async execute(dto: HandleSubscriptionDeletedDto): Promise<void> {
    const subscription = await this.subscriptionRepository.findByExternalId(dto.subscriptionId);
    if (subscription) {
      subscription.status = SubscriptionStatus.CANCELED;
      subscription.endDate = new Date();
      await this.subscriptionRepository.save(subscription);
    }
  }
}
