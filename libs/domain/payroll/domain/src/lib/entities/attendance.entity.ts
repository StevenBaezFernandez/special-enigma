import { AttendanceStatus } from '../enums';
import type { Employee } from './employee.entity';

export class Attendance {
  id!: string;
  tenantId!: string;
  date!: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: AttendanceStatus = AttendanceStatus.PRESENT;
  employee!: Employee;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(tenantId: string, employee: Employee, date: Date) {
    this.tenantId = tenantId;
    this.employee = employee;
    this.date = date;
  }
}
