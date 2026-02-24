import { Injectable } from '@nestjs/common';
import { TaxStrategy, TaxResult, TaxDetail, TaxRuleEngine } from '@virteex/domain-billing-domain';

@Injectable()
export class MxTaxStrategy implements TaxStrategy {
  constructor(private readonly taxRuleEngine: TaxRuleEngine) {}

  async calculate(amount: number): Promise<TaxResult> {
    const rules = await this.taxRuleEngine.getApplicableRules('MX', new Date());

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
