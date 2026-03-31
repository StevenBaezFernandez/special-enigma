import { FiscalPeriod } from '../entities/fiscal-period.entity';

export interface FiscalPeriodRepository {
  create(period: FiscalPeriod): Promise<FiscalPeriod>;
  findById(tenantId: string, id: string): Promise<FiscalPeriod | null>;
  findByDate(tenantId: string, date: Date): Promise<FiscalPeriod | null>;
  findAll(tenantId: string): Promise<FiscalPeriod[]>;
  save(period: FiscalPeriod): Promise<FiscalPeriod>;
}

export const FISCAL_PERIOD_REPOSITORY = 'FISCAL_PERIOD_REPOSITORY';
