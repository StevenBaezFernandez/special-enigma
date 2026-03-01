import { PayrollDetailType } from '../enums';
import type { Payroll } from './payroll.entity';

export class PayrollDetail {
  id!: string;
  tenantId!: string;
  concept!: string;
  amount!: number;
  type!: PayrollDetailType;
  payroll!: Payroll;
  createdAt: Date = new Date();

  constructor(tenantId: string, concept: string, amount: number, type: PayrollDetailType) {
    this.tenantId = tenantId;
    this.concept = concept;
    this.amount = amount;
    this.type = type;
  }
}
