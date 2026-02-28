import { TaxService } from './tax-service.port';

export interface TaxStrategyFactory {
  getStrategy(country: string): TaxService;
}

export const TAX_STRATEGY_FACTORY = 'PAYROLL_TAX_STRATEGY_FACTORY';
