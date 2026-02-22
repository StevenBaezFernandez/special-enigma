import { Injectable, Inject } from '@nestjs/common';
import { SubscriptionGateway, SUBSCRIPTION_GATEWAY } from '@virteex/subscription-domain';

export interface CreateCheckoutSessionDto {
  priceId: string;
  customerId: string;
  successUrl: string;
  cancelUrl: string;
  tenantId: string;
  planId: string;
}

@Injectable()
export class CreateCheckoutSessionUseCase {
  constructor(
    @Inject(SUBSCRIPTION_GATEWAY)
    private readonly subscriptionGateway: SubscriptionGateway
  ) {}

  async execute(dto: CreateCheckoutSessionDto): Promise<string> {
    return this.subscriptionGateway.createCheckoutSession(
      dto.priceId,
      dto.customerId,
      dto.successUrl,
      dto.cancelUrl,
      dto.tenantId,
      { planId: dto.planId }
    );
  }
}
