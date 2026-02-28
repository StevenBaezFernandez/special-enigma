import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { IPurchaseOrderRepository, PurchaseOrder } from '@virteex/domain-purchasing-domain';

@Injectable()
export class MikroOrmPurchaseOrderRepository implements IPurchaseOrderRepository {
  constructor(private readonly em: EntityManager) {}

  async save(order: PurchaseOrder): Promise<void> {
    await this.em.persistAndFlush(order);
  }

  async findById(id: string): Promise<PurchaseOrder | null> {
    return this.em.findOne(PurchaseOrder, { id }, { populate: ['items', 'supplier'] });
  }
}
