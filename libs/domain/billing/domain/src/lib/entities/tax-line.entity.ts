import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class TaxLine {
  @PrimaryKey()
  id!: string;

  @Property()
  taxName!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  rate!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  amount!: string;

  constructor(taxName: string, rate: string, amount: string) {
    this.taxName = taxName;
    this.rate = rate;
    this.amount = amount;
  }
}
