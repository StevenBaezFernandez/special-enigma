import { Injectable, Inject } from '@nestjs/common';
import { PaymentMethod, IPaymentMethodRepository, PAYMENT_METHOD_REPOSITORY } from '@virteex/domain-billing-domain';

@Injectable()
export class GetPaymentMethodUseCase {
  constructor(
    @Inject(PAYMENT_METHOD_REPOSITORY)
    private readonly paymentMethodRepository: IPaymentMethodRepository
  ) {}

  async execute(tenantId: string): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.findByTenantId(tenantId);
  }
}
