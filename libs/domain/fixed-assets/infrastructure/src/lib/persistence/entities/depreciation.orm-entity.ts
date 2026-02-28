import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { AssetOrmEntity } from './asset.orm-entity';

@Entity({ tableName: 'depreciations' })
export class DepreciationOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  date!: Date;

  @Property({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Property({ type: 'decimal', precision: 12, scale: 2 })
  accumulatedDepreciation!: number;

  @ManyToOne(() => AssetOrmEntity)
  asset!: AssetOrmEntity;

  @Property()
  createdAt!: Date;
}
