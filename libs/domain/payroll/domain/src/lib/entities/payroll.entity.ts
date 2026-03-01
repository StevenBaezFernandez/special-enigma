import { PayrollStatus, PayrollType } from '../enums';
import type { Employee } from './employee.entity';
import type { PayrollDetail } from './payroll-detail.entity';

export class Payroll {
  id!: string;
  tenantId!: string;
  periodStart!: Date;
  periodEnd!: Date;
  paymentDate!: Date;
  totalEarnings = 0;
  totalDeductions = 0;
  netPay = 0;
  status: PayrollStatus = PayrollStatus.DRAFT;
  type: PayrollType = PayrollType.REGULAR;
  employee!: Employee;
  details: PayrollDetail[] = [];
  fiscalUuid?: string;
  xmlContent?: string;
  stampedAt?: Date;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(tenantId: string, employee: Employee, periodStart: Date, periodEnd: Date, paymentDate: Date) {
    this.tenantId = tenantId;
    this.employee = employee;
    this.periodStart = periodStart;
    this.periodEnd = periodEnd;
    this.paymentDate = paymentDate;
  }
}
