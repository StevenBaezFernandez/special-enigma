import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  Subscription,
  SubscriptionStatus,
  SubscriptionRepository,
  SUBSCRIPTION_REPOSITORY,
  SubscriptionPlanRepository,
  SUBSCRIPTION_PLAN_REPOSITORY,
} from '@virteex/subscription-domain';

export interface ProcessCheckoutSuccessDto {
  tenantId: string;
  subscriptionId: string;
  customerId: string;
  planId?: string;
}

@Injectable()
export class ProcessCheckoutSuccessUseCase {
  private readonly logger = new Logger(ProcessCheckoutSuccessUseCase.name);

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(SUBSCRIPTION_PLAN_REPOSITORY)
    private readonly subscriptionPlanRepository: SubscriptionPlanRepository
  ) {}

  async execute(dto: ProcessCheckoutSuccessDto): Promise<void> {
    const { tenantId, subscriptionId, customerId, planId } = dto;

    let subscription = await this.subscriptionRepository.findByExternalId(subscriptionId);
    if (subscription) {
      return;
    }

    subscription = await this.subscriptionRepository.findByTenantId(tenantId);

    if (subscription) {
      subscription.externalSubscriptionId = subscriptionId;
      subscription.externalCustomerId = customerId;
      subscription.status = SubscriptionStatus.ACTIVE;

      if (planId) {
        const plan = await this.subscriptionPlanRepository.findById(planId);
        if (plan) {
          subscription.plan = plan;
        }
      }
      await this.subscriptionRepository.save(subscription);
    } else {
      if (planId) {
        const plan = await this.subscriptionPlanRepository.findById(planId);
        if (plan) {
          subscription = new Subscription(tenantId, plan, SubscriptionStatus.ACTIVE);
          subscription.externalSubscriptionId = subscriptionId;
          subscription.externalCustomerId = customerId;
          await this.subscriptionRepository.save(subscription);
        }
      }
    }
  }
}
