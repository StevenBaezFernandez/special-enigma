import { TaxStrategyFactory } from '../factories/tax-strategy.factory';
import { TaxResult } from '../repository-ports/tax-strategy.interface';

export class TaxCalculatorService {
  constructor(
    private readonly strategyFactory: TaxStrategyFactory
  ) {}

  async calculateTax(amount: number, jurisdiction: string): Promise<TaxResult> {
    const strategy = this.strategyFactory.getStrategy(jurisdiction);
    return await strategy.calculate(amount);
  }
}
