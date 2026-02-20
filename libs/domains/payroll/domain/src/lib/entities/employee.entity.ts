import { Entity, PrimaryKey, Property, Enum, OneToMany, Collection, Cascade } from '@mikro-orm/core';
import { EmployeeStatus } from '@virteex/payroll-contracts';
import type { Payroll } from './payroll.entity';
import type { Attendance } from './attendance.entity';

@Entity()
export class Employee {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  firstName!: string;

  @Property()
  lastName!: string;

  @Property({ unique: true })
  email!: string;

  @Property({ nullable: true })
  rfc?: string;

  @Property({ nullable: true })
  curp?: string;

  @Property({ nullable: true })
  nss?: string;

  @Property({ nullable: true })
  departmentId?: string;

  @Property({ nullable: true })
  position?: string;

  @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  salary = 0;

  @Property()
  hireDate!: Date;

  @Property({ nullable: true })
  postalCode?: string;

  // Fiscal properties
  @Property({ default: '01' })
  contractType = '01'; // 01: Contrato de trabajo por tiempo indeterminado

  @Property({ default: '02' })
  regimeType = '02'; // 02: Sueldos y Salarios

  @Property({ default: '04' })
  periodicity = '04'; // 04: Quincenal

  @Enum(() => EmployeeStatus)
  status: EmployeeStatus = EmployeeStatus.ACTIVE;

  @OneToMany('Payroll', 'employee', { cascade: [Cascade.ALL] })
  payrolls = new Collection<Payroll>(this);

  @OneToMany('Attendance', 'employee', { cascade: [Cascade.ALL] })
  attendanceRecords = new Collection<Attendance>(this);

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(tenantId: string, firstName: string, lastName: string, email: string, hireDate: Date) {
    this.tenantId = tenantId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.hireDate = hireDate;
  }
}
