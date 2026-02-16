import { Injectable, Inject } from '@nestjs/common';
import { TaxStrategyFactory, BILLING_TAX_STRATEGY_FACTORY } from '../strategies/tax-strategy.factory';
import { TaxResult } from '../strategies/tax-strategy.interface';

@Injectable()
export class TaxCalculatorService {
  constructor(
    @Inject(BILLING_TAX_STRATEGY_FACTORY) private readonly strategyFactory: TaxStrategyFactory
  ) {}

  async calculateTax(amount: number, jurisdiction: string): Promise<TaxResult> {
    const strategy = this.strategyFactory.getStrategy(jurisdiction);
    return await strategy.calculate(amount);
  }
}
