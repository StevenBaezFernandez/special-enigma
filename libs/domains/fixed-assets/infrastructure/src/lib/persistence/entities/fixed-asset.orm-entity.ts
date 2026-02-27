import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { AssetStatus } from '@virteex/domain-fixed-assets-domain';

@Entity({ tableName: 'fixed_assets' })
export class FixedAssetOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  name!: string;

  @Property()
  acquisitionDate!: Date;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  acquisitionCost!: string;

  @Property()
  depreciationRate!: number;

  @Property({ type: 'string' })
  status!: AssetStatus;
}
