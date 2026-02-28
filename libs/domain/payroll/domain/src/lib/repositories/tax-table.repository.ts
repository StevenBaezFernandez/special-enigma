import { TaxTable } from '../entities/tax-table.entity';

export const TAX_TABLE_REPOSITORY = 'TAX_TABLE_REPOSITORY';

export interface TaxTableRepository {
  findForYear(year: number, type: string, country?: string, state?: string): Promise<TaxTable[]>;
}
