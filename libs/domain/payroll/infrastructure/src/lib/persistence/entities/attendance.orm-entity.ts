import { Entity, PrimaryKey, Property, Enum, ManyToOne } from '@mikro-orm/core';
import { AttendanceStatus } from '@virteex/domain-payroll-domain/enums';

@Entity({ schema: 'payroll', tableName: 'attendance' })
export class AttendanceOrmEntity {
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

  @ManyToOne('EmployeeOrmEntity')
  employee!: any;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
