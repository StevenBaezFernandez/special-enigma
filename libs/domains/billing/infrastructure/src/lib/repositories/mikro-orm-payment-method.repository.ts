import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { IPaymentMethodRepository, PaymentMethod } from '@virteex/domain-billing-domain';

@Injectable()
export class MikroOrmPaymentMethodRepository implements IPaymentMethodRepository {
  constructor(private readonly em: EntityManager) {}

  async save(paymentMethod: PaymentMethod): Promise<void> {
    await this.em.persistAndFlush(paymentMethod);
  }

  async findByTenantId(tenantId: string): Promise<PaymentMethod[]> {
    return this.em.find(PaymentMethod, { tenantId });
  }

  async findById(id: string): Promise<PaymentMethod | null> {
    return this.em.findOne(PaymentMethod, { id });
  }
}
