import { OpportunityStage } from '@virteex/shared-contracts';
import type { Customer } from './customer.entity';

export class Opportunity {
  id!: string;
  tenantId!: string;
  title!: string;
  amount?: number;
  stage: OpportunityStage = OpportunityStage.PROSPECTING;
  closeDate?: Date;
  customer!: Customer;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(tenantId: string, customer: Customer, title: string) {
    this.tenantId = tenantId;
    this.customer = customer;
    this.title = title;
  }
}
