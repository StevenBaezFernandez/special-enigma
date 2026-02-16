import { Injectable } from '@nestjs/common';
import { TaxStrategy, TaxResult } from '../../../../domain/src/lib/strategies/tax-strategy.interface';

@Injectable()
export class BrTaxStrategy implements TaxStrategy {
  async calculate(amount: number): Promise<TaxResult> {
    const icmsRate = 0.18;
    const ipiRate = 0.05;

    const icmsAmount = amount * icmsRate;
    const ipiAmount = amount * ipiRate;

    return {
      totalTax: icmsAmount + ipiAmount,
      details: [
        {
          taxType: 'ICMS',
          rate: icmsRate,
          amount: icmsAmount
        },
        {
          taxType: 'IPI',
          rate: ipiRate,
          amount: ipiAmount
        }
      ]
    };
  }
}
