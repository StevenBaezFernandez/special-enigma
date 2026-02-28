import { Entity, PrimaryKey, Property, Enum, OneToMany, ManyToOne, Collection, Cascade } from '@mikro-orm/core';
import { PayrollStatus, PayrollType } from '../enums';
import type { Employee } from './employee.entity';
import type { PayrollDetail } from './payroll-detail.entity';

@Entity()
export class Payroll {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  periodStart!: Date;

  @Property()
  periodEnd!: Date;

  @Property()
  paymentDate!: Date;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  totalEarnings = 0;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  totalDeductions = 0;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  netPay = 0;

  @Enum(() => PayrollStatus)
  status: PayrollStatus = PayrollStatus.DRAFT;

  @Enum(() => PayrollType)
  type: PayrollType = PayrollType.REGULAR;

  @ManyToOne('Employee')
  employee!: Employee;

  @OneToMany('PayrollDetail', 'payroll', { cascade: [Cascade.ALL] })
  details = new Collection<PayrollDetail>(this);

  @Property({ nullable: true })
  fiscalUuid?: string;

  @Property({ nullable: true, type: 'text' })
  xmlContent?: string;

  @Property({ nullable: true })
  stampedAt?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(tenantId: string, employee: Employee, periodStart: Date, periodEnd: Date, paymentDate: Date) {
    this.tenantId = tenantId;
    this.employee = employee;
    this.periodStart = periodStart;
    this.periodEnd = periodEnd;
    this.paymentDate = paymentDate;
  }
}
