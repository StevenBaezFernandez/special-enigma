import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  Subscription,
  SubscriptionStatus,
  SubscriptionRepository,
  SUBSCRIPTION_REPOSITORY,
  SubscriptionPlanRepository,
  SUBSCRIPTION_PLAN_REPOSITORY,
  SubscriptionGateway,
  SUBSCRIPTION_GATEWAY
} from '@virteex/subscription-domain';

export interface ChangeSubscriptionPlanDto {
  tenantId: string;
  planId: string;
  price: string; // Stripe Price ID
}

export interface ChangeSubscriptionResult {
  subscription: Subscription;
  clientSecret: string;
}

@Injectable()
export class ChangeSubscriptionPlanUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(SUBSCRIPTION_PLAN_REPOSITORY)
    private readonly subscriptionPlanRepository: SubscriptionPlanRepository,
    @Inject(SUBSCRIPTION_GATEWAY)
    private readonly subscriptionGateway: SubscriptionGateway
  ) {}

  async execute(dto: ChangeSubscriptionPlanDto): Promise<ChangeSubscriptionResult> {
    const plan = await this.subscriptionPlanRepository.findById(dto.planId);
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${dto.planId} not found`);
    }

    const subscription = await this.subscriptionRepository.findByTenantId(dto.tenantId);

    if (!subscription || !subscription.stripeSubscriptionId) {
        throw new BadRequestException('No active subscription found for this tenant.');
    }

    const stripeSub = await this.subscriptionGateway.updateSubscription(subscription.stripeSubscriptionId, dto.price);

    // Update subscription details
    subscription.plan = plan;

    const statusMap: Record<string, SubscriptionStatus> = {
        'active': SubscriptionStatus.ACTIVE,
        'incomplete': SubscriptionStatus.PAYMENT_PENDING,
        'trialing': SubscriptionStatus.TRIAL
    };
    subscription.status = statusMap[stripeSub.status] || SubscriptionStatus.ACTIVE;

    subscription.currentPeriodEnd = stripeSub.currentPeriodEnd;
    subscription.endDate = stripeSub.currentPeriodEnd;
    subscription.cancelAtPeriodEnd = false;

    await this.subscriptionRepository.save(subscription);

    return {
        subscription,
        clientSecret: stripeSub.clientSecret
    };
  }
}
