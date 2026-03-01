import { TaxStrategyFactory, BILLING_TAX_STRATEGY_FACTORY } from '../strategies/tax-strategy.factory';
import { TaxResult } from '../strategies/tax-strategy.interface';

export class TaxCalculatorService {
  constructor(
    private readonly strategyFactory: TaxStrategyFactory
  ) {}

  async calculateTax(amount: number, jurisdiction: string): Promise<TaxResult> {
    const strategy = this.strategyFactory.getStrategy(jurisdiction);
    return await strategy.calculate(amount);
  }
}
