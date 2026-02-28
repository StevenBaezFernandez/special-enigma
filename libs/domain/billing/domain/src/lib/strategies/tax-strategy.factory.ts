import { TaxStrategy } from './tax-strategy.interface';

export const BILLING_TAX_STRATEGY_FACTORY = 'BILLING_TAX_STRATEGY_FACTORY';

export abstract class TaxStrategyFactory {
  abstract getStrategy(country: string): TaxStrategy;
}
