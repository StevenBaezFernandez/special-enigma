import { Injectable } from '@nestjs/common';
import { TaxStrategy, TaxResult, TaxDetail, TaxRuleEngine } from '@virteex/domain-billing-domain';

@Injectable()
export class DoTaxStrategy implements TaxStrategy {
  constructor(private readonly taxRuleEngine: TaxRuleEngine) {}

  async calculate(amount: number): Promise<TaxResult> {
    const rules = await this.taxRuleEngine.getApplicableRules('DO', new Date());

    let totalTax = 0;
    const details: TaxDetail[] = [];

    if (rules && rules.length > 0) {
      for (const rule of rules) {
        const rate = parseFloat(rule.rate);
        const taxAmount = amount * rate;
        totalTax += taxAmount;
        details.push({
          taxType: rule.taxType,
          rate: rate,
          amount: taxAmount,
        });
      }
    } else {
      // Default ITBIS for Dominican Republic if no rules are found in DB
      const itbisRate = 0.18;
      const itbisAmount = amount * itbisRate;
      totalTax = itbisAmount;
      details.push({
        taxType: 'ITBIS',
        rate: itbisRate,
        amount: itbisAmount,
      });
    }

    return {
      totalTax,
      details,
    };
  }
}
