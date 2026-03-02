import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import { PayrollStatus, PayrollType } from '../enums';
import type { Employee } from './employee.entity';
import type { PayrollDetail } from './payroll-detail.entity';

export class Payroll {
  id!: string;
  @Property()
  tenantId!: string;
  periodStart!: Date;
  periodEnd!: Date;
  paymentDate!: Date;
  totalEarnings = 0;
  totalDeductions = 0;
  netPay = 0;
  @Property()
  status: PayrollStatus = PayrollStatus.DRAFT;
  type: PayrollType = PayrollType.REGULAR;
  employee!: Employee;
  details: PayrollDetail[] = [];
  @Property()
  fiscalUuid?: string;
  @Property()
  xmlContent?: string;
  @Property()
  stampedAt?: Date;
  @Property()
  createdAt: Date = new Date();
  @Property()
  updatedAt: Date = new Date();

  constructor(tenantId: string, employee: Employee, periodStart: Date, periodEnd: Date, paymentDate: Date) {
    this.tenantId = tenantId;
    this.employee = employee;
    this.periodStart = periodStart;
    this.periodEnd = periodEnd;
    this.paymentDate = paymentDate;
  }
}
