import { EntitySchema, Cascade } from '@mikro-orm/core';
import { TaxTable, Employee, Payroll, Attendance, PayrollDetail } from '@virteex/domain-payroll-domain';

export const TaxTableSchema = new EntitySchema<TaxTable>({
  class: TaxTable,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    country: { type: 'string' },
    year: { type: 'number' },
    type: { type: 'string' },
    limit: { type: 'number' },
    fixed: { type: 'number' },
    percent: { type: 'number' },
    state: { type: 'string', nullable: true },
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
    rfc: { type: 'string', nullable: true },
    curp: { type: 'string', nullable: true },
    nss: { type: 'string', nullable: true },
    departmentId: { type: 'string', nullable: true },
    position: { type: 'string', nullable: true },
    salary: { type: 'number' },
    hireDate: { type: 'Date' },
    postalCode: { type: 'string', nullable: true },
    contractType: { type: 'string' },
    regimeType: { type: 'string' },
    periodicity: { type: 'string' },
    status: { type: 'string' },
    createdAt: { type: 'Date' },
    updatedAt: { type: 'Date' },
    payrolls: { kind: '1:m', entity: 'Payroll', mappedBy: 'employee', cascade: [Cascade.ALL] },
    attendanceRecords: { kind: '1:m', entity: 'Attendance', mappedBy: 'employee', cascade: [Cascade.ALL] },
  },
});

export const PayrollSchema = new EntitySchema<Payroll>({
  class: Payroll,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    periodStart: { type: 'Date' },
    periodEnd: { type: 'Date' },
    paymentDate: { type: 'Date' },
    totalEarnings: { type: 'number' },
    totalDeductions: { type: 'number' },
    netPay: { type: 'number' },
    status: { type: 'string' },
    type: { type: 'string' },
    employee: { kind: 'm:1', entity: 'Employee' },
    fiscalUuid: { type: 'string', nullable: true },
    xmlContent: { type: 'text', nullable: true },
    stampedAt: { type: 'Date', nullable: true },
    createdAt: { type: 'Date' },
    updatedAt: { type: 'Date' },
    details: { kind: '1:m', entity: 'PayrollDetail', mappedBy: 'payroll', cascade: [Cascade.ALL] },
  },
});

export const AttendanceSchema = new EntitySchema<Attendance>({
  class: Attendance,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    employeeId: { type: 'string' },
    date: { type: 'Date' },
    checkIn: { type: 'Date', nullable: true },
    checkOut: { type: 'Date', nullable: true },
    status: { type: 'string' },
    employee: { kind: 'm:1', entity: 'Employee' },
    createdAt: { type: 'Date' },
    updatedAt: { type: 'Date' },
  },
});

export const PayrollDetailSchema = new EntitySchema<PayrollDetail>({
  class: PayrollDetail,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    payroll: { kind: 'm:1', entity: 'Payroll' },
    employeeId: { type: 'string' },
    concept: { type: 'string' },
    amount: { type: 'number' },
    type: { type: 'string' },
    grossSalary: { type: 'string' },
    netSalary: { type: 'string' },
    taxWithheld: { type: 'string' },
    createdAt: { type: 'Date' },
  },
});
