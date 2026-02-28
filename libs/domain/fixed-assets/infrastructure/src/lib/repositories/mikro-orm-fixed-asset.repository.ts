import { Injectable } from '@nestjs/common';
import { FixedAssetRepository, FixedAsset } from '@virteex/domain-fixed-assets-domain';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { FixedAssetOrmEntity } from '../persistence/entities/fixed-asset.orm-entity';
import { FixedAssetsPersistenceMapper } from '../persistence/mappers/fixed-assets-persistence.mapper';

@Injectable()
export class MikroOrmFixedAssetRepository implements FixedAssetRepository {
  constructor(
    @InjectRepository(FixedAssetOrmEntity)
    private readonly repository: EntityRepository<FixedAssetOrmEntity>
  ) {}

  async save(asset: FixedAsset): Promise<void> {
    const ormEntity = FixedAssetsPersistenceMapper.toOrmEntity(asset);
    await this.repository.getEntityManager().persistAndFlush(ormEntity);
  }

  async findAll(): Promise<FixedAsset[]> {
    const assets = await this.repository.findAll();
    return assets.map(FixedAssetsPersistenceMapper.toDomainEntity);
  }
}
