import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity({ tableName: 'tax_tables' })
export class TaxTable {
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

  constructor(
    limit: number,
    fixed: number,
    percent: number,
    year: number,
    type: 'MONTHLY' | 'ANNUAL' = 'MONTHLY',
    country: string = 'MX',
    state?: string,
  ) {
    this.limit = limit;
    this.fixed = fixed;
    this.percent = percent;
    this.year = year;
    this.type = type;
    this.country = country;
    this.state = state;
  }
}
