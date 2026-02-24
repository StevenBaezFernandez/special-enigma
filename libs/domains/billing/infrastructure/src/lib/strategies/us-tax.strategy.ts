import { TaxStrategy, TaxResult } from '@virteex/domain-billing-domain';
import { Injectable, Logger } from '@nestjs/common';
import { Decimal } from 'decimal.js';

@Injectable()
export class UsTaxStrategy implements TaxStrategy {
  private readonly logger = new Logger(UsTaxStrategy.name);
  private readonly DEFAULT_STATE_RATE = 0.0825; // Placeholder average Sales Tax

  async calculate(amount: number): Promise<TaxResult> {
    this.logger.log(`Calculating US Sales Tax for amount: ${amount}`);

    const baseAmount = new Decimal(amount);
    const taxRate = new Decimal(this.DEFAULT_STATE_RATE);

    const taxAmount = baseAmount.times(taxRate);

    return {
      totalTax: taxAmount.toNumber(),
      details: [
        {
          taxType: 'SALES_TAX',
          rate: this.DEFAULT_STATE_RATE,
          amount: taxAmount.toNumber(),
        },
      ],
    };
  }
}
