import { Injectable, Inject } from '@nestjs/common';
import {
  SubscriptionStatus,
  SubscriptionRepository,
  SUBSCRIPTION_REPOSITORY,
} from '@virteex/domain-subscription-domain';

export interface HandleSubscriptionUpdatedDto {
  subscriptionId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

@Injectable()
export class HandleSubscriptionUpdatedUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async execute(dto: HandleSubscriptionUpdatedDto): Promise<void> {
    const subscription = await this.subscriptionRepository.findByExternalId(dto.subscriptionId);
    if (subscription) {
      subscription.status = dto.status;
      subscription.currentPeriodEnd = dto.currentPeriodEnd;
      subscription.endDate = dto.currentPeriodEnd;
      subscription.cancelAtPeriodEnd = dto.cancelAtPeriodEnd;

      await this.subscriptionRepository.save(subscription);
    }
  }
}
