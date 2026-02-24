import { Injectable } from '@nestjs/common';
import { ProductionOrderRepository, ProductionOrder } from '@virteex/domain-manufacturing-domain';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

@Injectable()
export class MikroOrmProductionOrderRepository implements ProductionOrderRepository {
  constructor(
    @InjectRepository(ProductionOrder)
    private readonly repository: EntityRepository<ProductionOrder>
  ) {}

  async save(order: ProductionOrder): Promise<void> {
    await this.repository.getEntityManager().persistAndFlush(order);
  }

  async findAll(): Promise<ProductionOrder[]> {
    return this.repository.findAll();
  }
}
