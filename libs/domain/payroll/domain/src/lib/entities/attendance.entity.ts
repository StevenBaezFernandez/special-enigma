import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import { AttendanceStatus } from '../enums';
import type { Employee } from './employee.entity';

export class Attendance {
  id!: string;
  @Property()
  tenantId!: string;
  date!: Date;
  checkIn?: Date;
  checkOut?: Date;
  @Property()
  status: AttendanceStatus = AttendanceStatus.PRESENT;
  employee!: Employee;
  @Property()
  createdAt: Date = new Date();
  @Property()
  updatedAt: Date = new Date();

  constructor(tenantId: string, employee: Employee, date: Date) {
    this.tenantId = tenantId;
    this.employee = employee;
    this.date = date;
  }
}
