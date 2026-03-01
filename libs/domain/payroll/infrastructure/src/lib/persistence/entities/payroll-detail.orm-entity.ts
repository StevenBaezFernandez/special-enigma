import { Entity, PrimaryKey, Property, Enum, ManyToOne } from '@mikro-orm/core';
import { PayrollDetailType } from '../../../domain/src/lib/enums';

@Entity({ schema: 'payroll', tableName: 'payroll_detail' })
export class PayrollDetailOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  concept!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Enum(() => PayrollDetailType)
  type!: PayrollDetailType;

  @ManyToOne('PayrollOrmEntity')
  payroll!: any;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();
}
