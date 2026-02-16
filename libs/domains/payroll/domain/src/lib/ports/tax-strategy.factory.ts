import { TaxService } from './tax-service.port';

export interface TaxStrategyFactory {
  getStrategy(country: string): TaxService;
}

export const TAX_STRATEGY_FACTORY = 'TAX_STRATEGY_FACTORY';
