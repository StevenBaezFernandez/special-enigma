import { Injectable, Inject } from '@nestjs/common';
import { PaymentMethod, PaymentMethodRepository, PAYMENT_METHOD_REPOSITORY } from '@virteex/domain-billing-domain';

@Injectable()
export class GetPaymentMethodUseCase {
  constructor(
    @Inject(PAYMENT_METHOD_REPOSITORY)
    private readonly repository: PaymentMethodRepository
  ) {}

  async execute(id: string): Promise<PaymentMethod | null> {
    return this.repository.findById(id);
  }
}
