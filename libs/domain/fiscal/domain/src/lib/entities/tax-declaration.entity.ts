import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";

@Entity()
export class TaxDeclaration {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
    tenantId!: string;

    period!: string;

  @Property()
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
