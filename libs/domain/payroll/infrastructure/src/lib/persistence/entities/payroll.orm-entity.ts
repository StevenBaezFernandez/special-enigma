import { Entity, PrimaryKey, Property, Enum, OneToMany, ManyToOne, Collection, Cascade } from '@mikro-orm/core';
import { PayrollStatus, PayrollType } from '../../../domain/src/lib/enums';

@Entity({ schema: 'payroll', tableName: 'payroll' })
export class PayrollOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  periodStart!: Date;

  @Property()
  periodEnd!: Date;

  @Property()
  paymentDate!: Date;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  totalEarnings = 0;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  totalDeductions = 0;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  netPay = 0;

  @Enum(() => PayrollStatus)
  status: PayrollStatus = PayrollStatus.DRAFT;

  @Enum(() => PayrollType)
  type: PayrollType = PayrollType.REGULAR;

  @ManyToOne('EmployeeOrmEntity')
  employee!: any;

  @OneToMany('PayrollDetailOrmEntity', 'payroll', { cascade: [Cascade.ALL] })
  details = new Collection<any>(this);

  @Property({ nullable: true })
  fiscalUuid?: string;

  @Property({ nullable: true, type: 'text' })
  xmlContent?: string;

  @Property({ nullable: true })
  stampedAt?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
