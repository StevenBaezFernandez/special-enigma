import { Injectable } from '@nestjs/common';
import { BillOfMaterialsRepository, BillOfMaterials } from '@virteex/domain-manufacturing-domain';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

@Injectable()
export class MikroOrmBillOfMaterialsRepository implements BillOfMaterialsRepository {
  constructor(
    @InjectRepository(BillOfMaterials)
    private readonly repository: EntityRepository<BillOfMaterials>
  ) {}

  async findById(id: string): Promise<BillOfMaterials | null> {
    return this.repository.findOne({ id });
  }

  async findByProductSku(productSku: string): Promise<BillOfMaterials | null> {
    return this.repository.findOne({ productSku, isActive: true }, { populate: ['components'] });
  }

  async save(bom: BillOfMaterials): Promise<void> {
    await this.repository.getEntityManager().persistAndFlush(bom);
  }

  async findAll(): Promise<BillOfMaterials[]> {
    return this.repository.findAll();
  }
}
