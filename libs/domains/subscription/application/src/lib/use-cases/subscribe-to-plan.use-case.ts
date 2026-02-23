import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  Subscription,
  SubscriptionStatus,
  SubscriptionRepository,
  SUBSCRIPTION_REPOSITORY,
  SubscriptionPlanRepository,
  SUBSCRIPTION_PLAN_REPOSITORY,
  SubscriptionGateway,
  SUBSCRIPTION_GATEWAY,
  CustomerManagementService
} from '@virteex/subscription-domain';

export interface SubscribeToPlanDto {
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
export class SubscribeToPlanUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(SUBSCRIPTION_PLAN_REPOSITORY)
    private readonly subscriptionPlanRepository: SubscriptionPlanRepository,
    @Inject(SUBSCRIPTION_GATEWAY)
    private readonly subscriptionGateway: SubscriptionGateway,
    private readonly customerManagementService: CustomerManagementService
  ) {}

  async execute(dto: SubscribeToPlanDto): Promise<SubscriptionResult> {
    const plan = await this.subscriptionPlanRepository.findById(dto.planId);
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${dto.planId} not found`);
    }

    let subscription = await this.subscriptionRepository.findByTenantId(dto.tenantId);

    if (subscription && subscription.stripeSubscriptionId &&
        (subscription.status === SubscriptionStatus.ACTIVE || subscription.status === SubscriptionStatus.TRIAL)) {
        throw new BadRequestException('Tenant already has an active subscription. Use change plan instead.');
    }

    const customerId = await this.customerManagementService.getOrCreateCustomerId(
        dto.email,
        dto.name,
        dto.paymentMethodId,
        dto.tenantId
    );

    const stripeSub = await this.subscriptionGateway.createSubscription(customerId, dto.price);

    if (!subscription) {
        subscription = new Subscription(dto.tenantId, plan);
    }

    // Update subscription details
    subscription.plan = plan;
    subscription.stripeCustomerId = customerId;
    subscription.stripeSubscriptionId = stripeSub.subscriptionId;

    const statusMap: Record<string, SubscriptionStatus> = {
        'active': SubscriptionStatus.ACTIVE,
        'incomplete': SubscriptionStatus.PAYMENT_PENDING,
        'trialing': SubscriptionStatus.TRIAL
    };
    subscription.status = statusMap[stripeSub.status] || SubscriptionStatus.PAYMENT_PENDING;

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
