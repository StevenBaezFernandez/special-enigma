import { Injectable, Inject, NotFoundException } from '@nestjs/common';
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

export interface CreateSubscriptionDto {
  tenantId: string;
  planId: string;
  price: string; // Stripe Price ID
  billingCycle: string;
  email: string;
  name: string;
  paymentMethodId: string;
}

export interface SubscriptionResult {
  subscription: Subscription;
  clientSecret: string;
}

@Injectable()
export class CreateSubscriptionUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(SUBSCRIPTION_PLAN_REPOSITORY)
    private readonly subscriptionPlanRepository: SubscriptionPlanRepository,
    @Inject(SUBSCRIPTION_GATEWAY)
    private readonly subscriptionGateway: SubscriptionGateway
  ) {}

  async execute(dto: CreateSubscriptionDto): Promise<SubscriptionResult> {
    const plan = await this.subscriptionPlanRepository.findById(dto.planId);
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${dto.planId} not found`);
    }

    let subscription = await this.subscriptionRepository.findByTenantId(dto.tenantId);
    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      customerId = await this.subscriptionGateway.createCustomer(dto.email, dto.name, dto.paymentMethodId);
    }

    let stripeSub;

    // Check if we should update or create
    if (subscription && subscription.stripeSubscriptionId &&
        (subscription.status === SubscriptionStatus.ACTIVE || subscription.status === SubscriptionStatus.TRIAL)) {
        // Update existing subscription
        stripeSub = await this.subscriptionGateway.updateSubscription(subscription.stripeSubscriptionId, dto.price);
    } else {
        // Create new subscription
        stripeSub = await this.subscriptionGateway.createSubscription(customerId, dto.price);
    }

    if (!subscription) {
        subscription = new Subscription(dto.tenantId, plan);
    }

    // Update subscription details
    subscription.plan = plan;
    subscription.stripeCustomerId = customerId;
    subscription.stripeSubscriptionId = stripeSub.subscriptionId;
    // We set status to INCOMPLETE initially if payment is required.
    // If status is incomplete, frontend uses clientSecret to confirm payment.
    const statusMap: Record<string, SubscriptionStatus> = {
        'active': SubscriptionStatus.ACTIVE,
        'incomplete': SubscriptionStatus.TRIAL, // Or PENDING_PAYMENT
        'trialing': SubscriptionStatus.TRIAL
    };
    subscription.status = statusMap[stripeSub.status] || SubscriptionStatus.TRIAL;

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
