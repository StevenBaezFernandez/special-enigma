import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class FixedAsset {
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

  @Property()
  status!: string;

  constructor(tenantId: string, name: string, acquisitionCost: string, rate: number) {
    this.tenantId = tenantId;
    this.name = name;
    this.acquisitionDate = new Date();
    this.acquisitionCost = acquisitionCost;
    this.depreciationRate = rate;
    this.status = 'ACTIVE';
  }
}
