import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity({ schema: 'payroll', tableName: 'tax_tables' })
export class TaxTableOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  limit!: number;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  fixed!: number;

  @Property({ type: 'decimal', precision: 5, scale: 2 })
  percent!: number;

  @Property()
  year!: number;

  @Property({ default: 'MONTHLY' })
  type!: string;

  @Property({ default: 'MX' })
  country!: string;

  @Property({ nullable: true })
  state?: string;
}
