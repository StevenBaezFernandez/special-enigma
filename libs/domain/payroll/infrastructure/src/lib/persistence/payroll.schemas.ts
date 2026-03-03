import { EntitySchema } from '@mikro-orm/core';
import { TaxTable, Employee, Payroll, Attendance, PayrollDetail } from '@virteex/domain-payroll-domain';

export const TaxTableSchema = new EntitySchema<TaxTable>({
  class: TaxTable,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    country: { type: 'string' },
    year: { type: 'number' },
    type: { type: 'string' },
    rules: { type: 'json' },
  },
});

export const EmployeeSchema = new EntitySchema<Employee>({
  class: Employee,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string' },
    taxId: { type: 'string' },
    salary: { type: 'string' },
  },
});

export const PayrollSchema = new EntitySchema<Payroll>({
  class: Payroll,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    periodStart: { type: 'Date' },
    periodEnd: { type: 'Date' },
    status: { type: 'string' },
    details: { kind: '1:m', entity: 'PayrollDetail', mappedBy: 'payroll', cascade: ['all'] },
  },
});

export const AttendanceSchema = new EntitySchema<Attendance>({
  class: Attendance,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    employeeId: { type: 'string' },
    date: { type: 'Date' },
    status: { type: 'string' },
  },
});

export const PayrollDetailSchema = new EntitySchema<PayrollDetail>({
  class: PayrollDetail,
  properties: {
    id: { primary: true, type: 'uuid' },
    payroll: { kind: 'm:1', entity: 'Payroll' },
    employeeId: { type: 'string' },
    grossSalary: { type: 'string' },
    netSalary: { type: 'string' },
    taxWithheld: { type: 'string' },
  },
});
