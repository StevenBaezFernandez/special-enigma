import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import { EmployeeStatus } from '../enums';
import type { Payroll } from './payroll.entity';
import type { Attendance } from './attendance.entity';

export class Employee {
  id!: string;
  @Property()
  tenantId!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
  rfc?: string;
  curp?: string;
  nss?: string;
  departmentId?: string;
  position?: string;
  salary = 0;
  hireDate!: Date;
  postalCode?: string;

  // Fiscal properties
  contractType = '01'; // 01: Contrato de trabajo por tiempo indeterminado
  regimeType = '02'; // 02: Sueldos y Salarios
  periodicity = '04'; // 04: Quincenal
  @Property()
  status: EmployeeStatus = EmployeeStatus.ACTIVE;
  payrolls: Payroll[] = [];
  attendanceRecords: Attendance[] = [];
  @Property()
  createdAt: Date = new Date();
  @Property()
  updatedAt: Date = new Date();

  constructor(tenantId: string, firstName: string, lastName: string, email: string, hireDate: Date) {
    this.tenantId = tenantId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.hireDate = hireDate;
  }
}
