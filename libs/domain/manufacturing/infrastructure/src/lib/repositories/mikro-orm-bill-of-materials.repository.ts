import { Injectable } from '@nestjs/common';
import {
  BillOfMaterialsRepository,
  BillOfMaterials,
} from '@virteex/domain-manufacturing-domain';
import { EntityManager } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/postgresql';

@Injectable()
export class MikroOrmBillOfMaterialsRepository
  implements BillOfMaterialsRepository
{
  private readonly repository: EntityRepository<BillOfMaterials>;

  constructor(private readonly em: EntityManager) {
    this.repository = this.em.getRepository(BillOfMaterials);
  }

  async findById(id: string): Promise<BillOfMaterials | null> {
    return this.repository.findOne({ id });
  }

  async findByProductSku(productSku: string): Promise<BillOfMaterials | null> {
    return this.repository.findOne(
      { productSku, isActive: true },
      { populate: ['components'] },
    );
  }

  async save(bom: BillOfMaterials): Promise<void> {
    await this.repository.getEntityManager().persistAndFlush(bom);
  }

  async findAll(): Promise<BillOfMaterials[]> {
    return this.repository.findAll();
  }
}
