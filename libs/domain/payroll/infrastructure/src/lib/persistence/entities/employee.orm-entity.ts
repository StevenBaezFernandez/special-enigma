import { Entity, PrimaryKey, Property, Enum, OneToMany, Collection, Cascade } from '@mikro-orm/core';
import { EmployeeStatus } from '@virteex/domain-payroll-domain/enums';

@Entity({ schema: 'payroll', tableName: 'employee' })
export class EmployeeOrmEntity {
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

  @Property({ default: '01' })
  contractType = '01';

  @Property({ default: '02' })
  regimeType = '02';

  @Property({ default: '04' })
  periodicity = '04';

  @Enum(() => EmployeeStatus)
  status: EmployeeStatus = EmployeeStatus.ACTIVE;

  @OneToMany('PayrollOrmEntity', 'employee', { cascade: [Cascade.ALL] })
  payrolls = new Collection<any>(this);

  @OneToMany('AttendanceOrmEntity', 'employee', { cascade: [Cascade.ALL] })
  attendanceRecords = new Collection<any>(this);

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
