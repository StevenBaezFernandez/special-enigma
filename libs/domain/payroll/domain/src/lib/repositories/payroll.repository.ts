import { Payroll } from '../entities/payroll.entity';

export interface PayrollRepository {
  save(payroll: Payroll): Promise<void>;
  findById(id: string): Promise<Payroll | null>;
  findAllByTenant(tenantId: string): Promise<Payroll[]>;
  findByEmployeeAndPeriod(employeeId: string, start: Date, end: Date): Promise<Payroll | null>;
}

export const PAYROLL_REPOSITORY = 'PAYROLL_REPOSITORY';
