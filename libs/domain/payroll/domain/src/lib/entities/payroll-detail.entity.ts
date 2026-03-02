import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import { PayrollDetailType } from '../enums';
import type { Payroll } from './payroll.entity';

export class PayrollDetail {
  id!: string;
  @Property()
  tenantId!: string;
  concept!: string;
  @Property()
  amount!: number;
  type!: PayrollDetailType;
  payroll!: Payroll;
  @Property()
  createdAt: Date = new Date();

  constructor(tenantId: string, concept: string, amount: number, type: PayrollDetailType) {
    this.tenantId = tenantId;
    this.concept = concept;
    this.amount = amount;
    this.type = type;
  }
}
