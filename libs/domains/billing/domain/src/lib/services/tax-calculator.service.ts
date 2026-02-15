import { Injectable } from '@nestjs/common';
import { TaxStrategy, TaxResult } from '../strategies/tax-strategy.interface';
import { MxTaxStrategy } from '../strategies/mx-tax.strategy';
import { BrTaxStrategy } from '../strategies/br-tax.strategy';
import type { TaxRuleEngine } from './tax-rule.engine';

@Injectable()
export class TaxCalculatorService {
  private strategies: Map<string, TaxStrategy> = new Map();

  constructor(private readonly taxRuleEngine: TaxRuleEngine) {
    this.strategies.set('MX', new MxTaxStrategy(this.taxRuleEngine));
    this.strategies.set('BR', new BrTaxStrategy());
  }

  async calculateTax(amount: number, jurisdiction: string): Promise<TaxResult> {
    const strategy = this.strategies.get(jurisdiction);

    if (!strategy) {
       // Return zero tax if no strategy found
       return { totalTax: 0, details: [] };
    }

    return await strategy.calculate(amount);
  }
}
