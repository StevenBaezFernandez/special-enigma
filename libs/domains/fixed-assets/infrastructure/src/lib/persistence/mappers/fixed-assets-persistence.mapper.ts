import { FixedAsset } from '@virteex/domain-fixed-assets-domain';
import { FixedAssetOrmEntity } from '../entities/fixed-asset.orm-entity';

export class FixedAssetsPersistenceMapper {
  static toOrmEntity(domain: FixedAsset): FixedAssetOrmEntity {
    const orm = new FixedAssetOrmEntity();
    orm.id = domain.id;
    orm.tenantId = domain.tenantId;
    orm.name = domain.name;
    orm.acquisitionDate = domain.acquisitionDate;
    orm.acquisitionCost = domain.acquisitionCost;
    orm.depreciationRate = domain.depreciationRate;
    orm.status = domain.status;
    return orm;
  }

  static toDomainEntity(orm: FixedAssetOrmEntity): FixedAsset {
    return new FixedAsset({
      id: orm.id,
      tenantId: orm.tenantId,
      name: orm.name,
      acquisitionDate: orm.acquisitionDate,
      acquisitionCost: orm.acquisitionCost,
      depreciationRate: orm.depreciationRate,
      status: orm.status,
    });
  }
}
