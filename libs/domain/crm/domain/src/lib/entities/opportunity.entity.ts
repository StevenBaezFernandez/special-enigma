import { Entity, PrimaryKey, Property, Enum, ManyToOne } from '@mikro-orm/core';
import { OpportunityStage } from '@virteex/shared-contracts';
import type { Customer } from './customer.entity';

@Entity()
export class Opportunity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  title!: string;

  @Property({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  amount?: number;

  @Enum(() => OpportunityStage)
  stage: OpportunityStage = OpportunityStage.PROSPECTING;

  @Property({ nullable: true })
  closeDate?: Date;

  @ManyToOne('Customer')
  customer!: Customer;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(tenantId: string, customer: Customer, title: string) {
    this.tenantId = tenantId;
    this.customer = customer;
    this.title = title;
  }
}
