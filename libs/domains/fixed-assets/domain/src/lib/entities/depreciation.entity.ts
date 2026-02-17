import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import type { Asset } from './asset.entity';

@Entity()
export class Depreciation {
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

  @ManyToOne('Asset')
  asset!: Asset;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  constructor(tenantId: string, asset: Asset, date: Date, amount: number, accumulatedDepreciation: number) {
    this.tenantId = tenantId;
    this.asset = asset;
    this.date = date;
    this.amount = amount;
    this.accumulatedDepreciation = accumulatedDepreciation;
  }
}
