import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import { OpportunityStage } from '@virteex/shared-contracts';
import type { Customer } from './customer.entity';

@Entity()
export class Opportunity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
    tenantId!: string;

    title!: string;

  @Property()
    amount?: number;

  @Enum(() => OpportunityStage)
  stage: OpportunityStage = OpportunityStage.PROSPECTING;

    closeDate?: Date;

  @ManyToOne('Customer')
  customer!: Customer;

  @Property()
    createdAt: Date = new Date();

  @Property()
    updatedAt: Date = new Date();

  constructor(tenantId: string, customer: Customer, title: string) {
    this.tenantId = tenantId;
    this.customer = customer;
    this.title = title;
  }
}
