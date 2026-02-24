import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  Subscription,
  SubscriptionStatus,
  SubscriptionRepository,
  SUBSCRIPTION_REPOSITORY,
  SubscriptionPlanRepository,
  SUBSCRIPTION_PLAN_REPOSITORY,
  SubscriptionProviderGateway,
  SUBSCRIPTION_PROVIDER_GATEWAY,
  CustomerIdentityService
} from '@virteex/domain-subscription-domain';

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
    @Inject(SUBSCRIPTION_PROVIDER_GATEWAY)
    private readonly subscriptionProviderGateway: SubscriptionProviderGateway,
    private readonly customerIdentityService: CustomerIdentityService
  ) {}

  async execute(dto: SubscribeToPlanDto): Promise<SubscriptionResult> {
    const plan = await this.subscriptionPlanRepository.findById(dto.planId);
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${dto.planId} not found`);
    }

    let subscription = await this.subscriptionRepository.findByTenantId(dto.tenantId);

    if (subscription && subscription.externalSubscriptionId &&
        (subscription.status === SubscriptionStatus.ACTIVE || subscription.status === SubscriptionStatus.TRIAL)) {
        throw new BadRequestException('Tenant already has an active subscription. Use change plan instead.');
    }

    const customerId = await this.customerIdentityService.getOrCreateExternalId(
        dto.email,
        dto.name,
        dto.paymentMethodId,
        dto.tenantId
    );

    const externalSub = await this.subscriptionProviderGateway.createSubscription(customerId, dto.price);

    if (!subscription) {
        subscription = new Subscription(dto.tenantId, plan);
    }

    // Update subscription details
    subscription.plan = plan;
    subscription.externalCustomerId = customerId;
    subscription.externalSubscriptionId = externalSub.subscriptionId;
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
