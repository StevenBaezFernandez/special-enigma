import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  Subscription,
  SubscriptionRepository,
  SUBSCRIPTION_REPOSITORY,
  SubscriptionPlanRepository,
  SUBSCRIPTION_PLAN_REPOSITORY
} from '@virteex/subscription-domain';

export interface CreateSubscriptionDto {
  tenantId: string;
  planId: string;
  price: string;
  billingCycle: string;
}

@Injectable()
export class CreateSubscriptionUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(SUBSCRIPTION_PLAN_REPOSITORY)
    private readonly subscriptionPlanRepository: SubscriptionPlanRepository
  ) {}

  async execute(dto: CreateSubscriptionDto): Promise<Subscription> {
    const plan = await this.subscriptionPlanRepository.findById(dto.planId);
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${dto.planId} not found`);
    }

    const nextBillingDate = new Date();
    if (dto.billingCycle === 'monthly') {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else if (dto.billingCycle === 'yearly') {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }

    const subscription = new Subscription(
      dto.tenantId,
      plan
    );
    // If Subscription entity supports endDate, we set it.
    // Based on previous read, Subscription has endDate property but constructor doesn't take it.
    // We can set it manually.
    subscription.endDate = nextBillingDate;

    await this.subscriptionRepository.save(subscription);
    return subscription;
  }
}
