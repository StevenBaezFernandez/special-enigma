import { TaxStrategy } from './tax-strategy.interface';

export interface TaxStrategyFactory {
  getStrategy(country: string): TaxStrategy;
}

export const BILLING_TAX_STRATEGY_FACTORY = 'BILLING_TAX_STRATEGY_FACTORY';
