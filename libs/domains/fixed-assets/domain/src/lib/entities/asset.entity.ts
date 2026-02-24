import { Entity, PrimaryKey, Property, Enum, OneToMany, Collection, Cascade } from '@mikro-orm/core';
import { AssetStatus, DepreciationMethod } from '@virteex/shared-contracts';
import type { Depreciation } from './depreciation.entity';

@Entity()
export class Asset {
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
  status: AssetStatus = AssetStatus.ACTIVE;

  @Enum(() => DepreciationMethod)
  depreciationMethod: DepreciationMethod = DepreciationMethod.STRAIGHT_LINE;

  @OneToMany('Depreciation', 'asset', { cascade: [Cascade.ALL] })
  depreciations = new Collection<Depreciation>(this);

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(tenantId: string, name: string, code: string, purchaseDate: Date, purchaseCost: number, residualValue: number, usefulLifeMonths: number) {
    this.tenantId = tenantId;
    this.name = name;
    this.code = code;
    this.purchaseDate = purchaseDate;
    this.purchaseCost = purchaseCost;
    this.residualValue = residualValue;
    this.usefulLifeMonths = usefulLifeMonths;
  }
}
