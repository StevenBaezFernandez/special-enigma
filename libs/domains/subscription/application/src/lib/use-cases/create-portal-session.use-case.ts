import { Injectable, Inject } from '@nestjs/common';
import { SubscriptionGateway, SUBSCRIPTION_GATEWAY } from '@virteex/subscription-domain';

export interface CreatePortalSessionDto {
  customerId: string;
  returnUrl: string;
}

@Injectable()
export class CreatePortalSessionUseCase {
  constructor(
    @Inject(SUBSCRIPTION_GATEWAY)
    private readonly subscriptionGateway: SubscriptionGateway
  ) {}

  async execute(dto: CreatePortalSessionDto): Promise<string> {
    return this.subscriptionGateway.createPortalSession(
      dto.customerId,
      dto.returnUrl
    );
  }
}
