
import { v4 } from 'uuid';

export class TaxTable {
  id: string = v4();
  tenantId!: string;
  limit!: number;
  fixed!: number;
  percent!: number;
  year!: number;
  type!: string;
  country!: string;
  state?: string;

  constructor(
    tenantId: string,
    limit: number,
    fixed: number,
    percent: number,
    year: number,
    type: 'MONTHLY' | 'ANNUAL' = 'MONTHLY',
    country = 'MX',
    state?: string,
  ) {
    this.tenantId = tenantId;
    this.limit = limit;
    this.fixed = fixed;
    this.percent = percent;
    this.year = year;
    this.type = type;
    this.country = country;
    this.state = state;
  }
}
