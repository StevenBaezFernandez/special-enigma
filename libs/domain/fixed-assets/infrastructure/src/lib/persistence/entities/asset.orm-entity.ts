import { Entity, PrimaryKey, Property, Enum, OneToMany, Collection, Cascade } from '@mikro-orm/core';
import { AssetStatus, DepreciationMethod } from '@virteex/domain-fixed-assets-domain';

@Entity({ tableName: 'assets' })
export class AssetOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  name!: string;

  @Property({ unique: true })
  code!: string;

  @Property()
  purchaseDate!: Date;

  @Property({ type: 'decimal', precision: 12, scale: 2 })
  purchaseCost!: number;

  @Property({ type: 'decimal', precision: 12, scale: 2 })
  residualValue!: number;

  @Property()
  usefulLifeMonths!: number;

  @Enum(() => AssetStatus)
  status!: AssetStatus;

  @Enum(() => DepreciationMethod)
  depreciationMethod!: DepreciationMethod;

  @OneToMany('DepreciationOrmEntity', 'asset', { cascade: [Cascade.ALL] })
  depreciations = new Collection<any>(this);

  @Property()
  createdAt!: Date;

  @Property()
  updatedAt!: Date;
}
