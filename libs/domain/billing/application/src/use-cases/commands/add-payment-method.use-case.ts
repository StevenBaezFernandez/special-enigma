import { Injectable, Inject } from '@nestjs/common';
import { PaymentMethod, type PaymentMethodRepository, PAYMENT_METHOD_REPOSITORY } from '@virteex/domain-billing-domain';

export interface AddPaymentMethodDto {
  tenantId: string;
  type: string;
  last4: string;
  expiryDate: string;
}

@Injectable()
export class AddPaymentMethodUseCase {
  constructor(
    @Inject(PAYMENT_METHOD_REPOSITORY)
    private readonly repository: PaymentMethodRepository
  ) {}

  async execute(dto: AddPaymentMethodDto): Promise<PaymentMethod> {
    const paymentMethod = new PaymentMethod(dto.tenantId, dto.type, dto.last4, dto.expiryDate);
    await this.repository.save(paymentMethod);
    return paymentMethod;
  }
}
