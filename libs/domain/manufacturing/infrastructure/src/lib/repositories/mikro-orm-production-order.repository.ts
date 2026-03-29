import { Injectable } from '@nestjs/common';
import {
  ProductionOrderRepository,
  ProductionOrder,
} from '@virteex/domain-manufacturing-domain';
import { EntityManager } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/postgresql';

@Injectable()
export class MikroOrmProductionOrderRepository
  implements ProductionOrderRepository
{
  private readonly repository: EntityRepository<ProductionOrder>;

  constructor(private readonly em: EntityManager) {
    this.repository = this.em.getRepository(ProductionOrder);
  }

  async save(order: ProductionOrder): Promise<void> {
    await this.repository.getEntityManager().persistAndFlush(order);
  }

  async findAll(): Promise<ProductionOrder[]> {
    return this.repository.findAll();
  }

  async transactional<T>(fn: () => Promise<T>): Promise<T> {
    return this.repository.getEntityManager().transactional(fn);
  }
}
