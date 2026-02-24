import { Entity, PrimaryKey, Property, Enum, ManyToOne } from '@mikro-orm/core';
import { AttendanceStatus } from '@virteex/contracts-payroll-contracts';
import type { Employee } from './employee.entity';

@Entity()
export class Attendance {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  date!: Date;

  @Property({ nullable: true })
  checkIn?: Date;

  @Property({ nullable: true })
  checkOut?: Date;

  @Enum(() => AttendanceStatus)
  status: AttendanceStatus = AttendanceStatus.PRESENT;

  @ManyToOne('Employee')
  employee!: Employee;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(tenantId: string, employee: Employee, date: Date) {
    this.tenantId = tenantId;
    this.employee = employee;
    this.date = date;
  }
}
