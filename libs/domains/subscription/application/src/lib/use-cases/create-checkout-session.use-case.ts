import { Injectable, Inject } from '@nestjs/common';
import { PaymentSessionProvider, PAYMENT_SESSION_PROVIDER } from '@virteex/subscription-domain';

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
    @Inject(PAYMENT_SESSION_PROVIDER)
    private readonly paymentSessionProvider: PaymentSessionProvider
  ) {}

  async execute(dto: CreateCheckoutSessionDto): Promise<string> {
    return this.paymentSessionProvider.createCheckoutSession(
      dto.priceId,
      dto.customerId,
      dto.successUrl,
      dto.cancelUrl,
      dto.tenantId,
      { planId: dto.planId }
    );
  }
}
