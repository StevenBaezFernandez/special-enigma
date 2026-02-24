import { Injectable, Inject } from '@nestjs/common';
import {
  SubscriptionStatus,
  SubscriptionRepository,
  SUBSCRIPTION_REPOSITORY,
} from '@virteex/domain-subscription-domain';

export interface HandleInvoicePaidDto {
  subscriptionId: string;
}

@Injectable()
export class HandleInvoicePaidUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async execute(dto: HandleInvoicePaidDto): Promise<void> {
    const subscription = await this.subscriptionRepository.findByExternalId(dto.subscriptionId);
    if (subscription) {
      if (subscription.status !== SubscriptionStatus.ACTIVE) {
        subscription.status = SubscriptionStatus.ACTIVE;
        await this.subscriptionRepository.save(subscription);
      }
    }
  }
}
