import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import Decimal from 'decimal.js';

@Entity()
export class FixedAsset {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

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

  calculateMonthlyDepreciation(): Decimal {
    // Basic straight-line depreciation
    // Rate is annual percentage (e.g. 10 for 10%)
    const cost = new Decimal(this.acquisitionCost);
    const annualDepreciation = cost.mul(this.depreciationRate).div(100);
    return annualDepreciation.div(12);
  }

  getBookValue(monthsElapsed: number): Decimal {
    const cost = new Decimal(this.acquisitionCost);
    const depreciation = this.calculateMonthlyDepreciation().mul(monthsElapsed);
    const bookValue = cost.minus(depreciation);
    return bookValue.isNegative() ? new Decimal(0) : bookValue;
  }
}
