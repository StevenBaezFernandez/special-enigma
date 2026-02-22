import { Injectable, Inject } from '@nestjs/common';
import { SubscriptionPlanRepository, SUBSCRIPTION_PLAN_REPOSITORY, SubscriptionPlan } from '@virteex/subscription-domain';

@Injectable()
export class GetSubscriptionPlansUseCase {
  constructor(
    @Inject(SUBSCRIPTION_PLAN_REPOSITORY)
    private readonly repository: SubscriptionPlanRepository
  ) {}

  async execute(): Promise<SubscriptionPlan[]> {
    return this.repository.findAll();
  }
}
