import { TaxStrategy, TaxResult } from '@virteex/domain-billing-domain';
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { Decimal } from 'decimal.js';

// Comprehensive lookup table for US Sales Tax by State (Average Rates for 2024)
// TODO: [Hardened Blocked] This is a fallback table. Production requires Avalara/TaxJar integration for precise jurisdiction-level tax.
const US_STATE_TAX_RATES: Record<string, number> = {
    'AL': 0.0400, 'AK': 0.0000, 'AZ': 0.0560, 'AR': 0.0650, 'CA': 0.0725,
    'CO': 0.0290, 'CT': 0.0635, 'DE': 0.0000, 'DC': 0.0600, 'FL': 0.0600,
    'GA': 0.0400, 'HI': 0.0400, 'ID': 0.0600, 'IL': 0.0625, 'IN': 0.0700,
    'IA': 0.0600, 'KS': 0.0650, 'KY': 0.0600, 'LA': 0.0445, 'ME': 0.0550,
    'MD': 0.0600, 'MA': 0.0625, 'MI': 0.0600, 'MN': 0.0688, 'MS': 0.0700,
    'MO': 0.0423, 'MT': 0.0000, 'NE': 0.0550, 'NV': 0.0685, 'NH': 0.0000,
    'NJ': 0.0663, 'NM': 0.0513, 'NY': 0.0400, 'NC': 0.0475, 'ND': 0.0500,
    'OH': 0.0575, 'OK': 0.0450, 'OR': 0.0000, 'PA': 0.0600, 'RI': 0.0700,
    'SC': 0.0600, 'SD': 0.0450, 'TN': 0.0700, 'TX': 0.0625, 'UT': 0.0610,
    'VT': 0.0600, 'VA': 0.0530, 'WA': 0.0650, 'WV': 0.0600, 'WI': 0.0500,
    'WY': 0.0400
};

@Injectable()
export class UsTaxStrategy implements TaxStrategy {
  private readonly logger = new Logger(UsTaxStrategy.name);

  async calculate(amount: number, context?: { state?: string, zip?: string }): Promise<TaxResult> {
    const isProduction = process.env['NODE_ENV'] === 'production' || process.env['RELEASE_STAGE'] === 'production';
    const stateCode = context?.state ? context.state.toUpperCase() : null;

    if (isProduction && !process.env['ENABLE_US_TAX_FALLBACK']) {
       this.logger.error('CRITICAL: US Tax calculation requested in production without external partner integration.');
       throw new InternalServerErrorException('US Tax calculation requires external partner (Avalara/TaxJar) in production. Fallback is disabled.');
    }

    let rate = 0.00;

    if (stateCode && US_STATE_TAX_RATES[stateCode] !== undefined) {
        rate = US_STATE_TAX_RATES[stateCode];
        this.logger.log(`Calculating US Sales Tax (Fallback) for ${stateCode}: ${rate * 100}% on amount ${amount}`);
    } else {
        this.logger.warn(`State code not provided or invalid (${stateCode}). Using 0% tax.`);
    }

    const baseAmount = new Decimal(amount);
    const taxRate = new Decimal(rate);
    const taxAmount = baseAmount.times(taxRate);

    return {
      totalTax: taxAmount.toNumber(),
      details: [
        {
          taxType: 'SALES_TAX',
          rate: rate,
          amount: taxAmount.toNumber(),
        },
      ],
    };
  }
}
