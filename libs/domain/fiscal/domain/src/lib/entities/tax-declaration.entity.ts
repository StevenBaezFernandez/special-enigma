import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class TaxDeclaration {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  period!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  amount!: string;

  @Property()
  status!: string;

  constructor(tenantId: string, period: string, amount: string) {
    this.tenantId = tenantId;
    this.period = period;
    this.amount = amount;
    this.status = 'DRAFT';
  }
}
