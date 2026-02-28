import { PaymentMethod } from '../entities/payment-method.entity';

export const PAYMENT_METHOD_REPOSITORY = 'PAYMENT_METHOD_REPOSITORY';

export interface IPaymentMethodRepository {
  save(paymentMethod: PaymentMethod): Promise<void>;
  findByTenantId(tenantId: string): Promise<PaymentMethod[]>;
  findById(id: string): Promise<PaymentMethod | null>;
}
