import { Injectable } from '@nestjs/common';
import { FixedAssetRepository, FixedAsset } from '@virteex/domain-fixed-assets-domain';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

@Injectable()
export class MikroOrmFixedAssetRepository implements FixedAssetRepository {
  constructor(
    @InjectRepository(FixedAsset)
    private readonly repository: EntityRepository<FixedAsset>
  ) {}

  async save(asset: FixedAsset): Promise<void> {
    await this.repository.getEntityManager().persistAndFlush(asset);
  }

  async findAll(): Promise<FixedAsset[]> {
    return this.repository.findAll();
  }
}
