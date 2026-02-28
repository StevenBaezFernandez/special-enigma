import { Injectable, Inject } from '@nestjs/common';
import { PaymentSessionProvider, PAYMENT_SESSION_PROVIDER } from '@virteex/domain-subscription-domain';

export interface CreatePortalSessionDto {
  customerId: string;
  returnUrl: string;
}

@Injectable()
export class CreatePortalSessionUseCase {
  constructor(
    @Inject(PAYMENT_SESSION_PROVIDER)
    private readonly paymentSessionProvider: PaymentSessionProvider
  ) {}

  async execute(dto: CreatePortalSessionDto): Promise<string> {
    return this.paymentSessionProvider.createPortalSession(
      dto.customerId,
      dto.returnUrl
    );
  }
}
