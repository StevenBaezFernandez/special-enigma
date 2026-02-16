import { TaxStrategy, TaxResult, TaxDetail } from './tax-strategy.interface';
import { TaxRuleEngine } from '../services/tax-rule.engine';

export class MxTaxStrategy implements TaxStrategy {
  constructor(private readonly taxRuleEngine: TaxRuleEngine) {}

  async calculate(amount: number, tenantId: string): Promise<TaxResult> {
    const rules = await this.taxRuleEngine.getApplicableRules('MX', tenantId);

    if (!rules || rules.length === 0) {
        return { totalTax: 0, details: [] };
    }

    let totalTax = 0;
    const details: TaxDetail[] = [];

    for (const rule of rules) {
        const rate = parseFloat(rule.rate);
        const taxAmount = amount * rate;
        totalTax += taxAmount;
        details.push({
            taxType: rule.taxType,
            rate: rate,
            amount: taxAmount
        });
    }

    return {
      totalTax,
      details
    };
  }
}
