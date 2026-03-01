import { DomainException } from '@virteex/shared-util-server-server-config';
import { Injectable, Inject } from '@nestjs/common';
import {
  Subscription,
  SubscriptionRepository,
  SUBSCRIPTION_REPOSITORY,
  SubscriptionPlanRepository,
  SUBSCRIPTION_PLAN_REPOSITORY,
  SubscriptionProviderGateway,
  SUBSCRIPTION_PROVIDER_GATEWAY
} from '@virteex/domain-subscription-domain';

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
    @Inject(SUBSCRIPTION_PROVIDER_GATEWAY)
    private readonly subscriptionProviderGateway: SubscriptionProviderGateway
  ) {}

  async execute(dto: ChangeSubscriptionPlanDto): Promise<ChangeSubscriptionResult> {
    const plan = await this.subscriptionPlanRepository.findById(dto.planId);
    if (!plan) {
      throw new DomainException(`Plan with ID ${dto.planId} not found`, 'ENTITY_NOT_FOUND');
    }

    const subscription = await this.subscriptionRepository.findByTenantId(dto.tenantId);

    if (!subscription || !subscription.externalSubscriptionId) {
        throw new DomainException('No active subscription found for this tenant.', 'BAD_REQUEST');
    }

    const externalSub = await this.subscriptionProviderGateway.updateSubscription(subscription.externalSubscriptionId, dto.price);

    // Update subscription details
    subscription.plan = plan;
    subscription.status = externalSub.status;
    subscription.currentPeriodEnd = externalSub.currentPeriodEnd;
    subscription.endDate = externalSub.currentPeriodEnd;
    subscription.cancelAtPeriodEnd = false;

    await this.subscriptionRepository.save(subscription);

    return {
        subscription,
        clientSecret: externalSub.clientSecret
    };
  }
}
