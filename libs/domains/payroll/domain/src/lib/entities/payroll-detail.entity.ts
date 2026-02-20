import { Entity, PrimaryKey, Property, Enum, ManyToOne } from '@mikro-orm/core';
import { PayrollDetailType } from '@virteex/payroll-contracts';
import type { Payroll } from './payroll.entity';

@Entity()
export class PayrollDetail {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  concept!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Enum(() => PayrollDetailType)
  type!: PayrollDetailType;

  @ManyToOne('Payroll')
  payroll!: Payroll;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  constructor(tenantId: string, concept: string, amount: number, type: PayrollDetailType) {
    this.tenantId = tenantId;
    this.concept = concept;
    this.amount = amount;
    this.type = type;
  }
}
