import { Injectable, Inject, Logger } from '@nestjs/common';
import { TaxService, TaxTableRepository, MissingTaxTableException, TAX_TABLE_REPOSITORY, TaxTable, PayrollTaxesResult } from '@virteex/payroll-domain';
import { Decimal } from 'decimal.js';

@Injectable()
export class GenericLatamStrategy implements TaxService {
  private readonly logger = new Logger(GenericLatamStrategy.name);
  private readonly cache = new Map<string, TaxTable[]>();

  constructor(
    @Inject(TAX_TABLE_REPOSITORY)
    private readonly repository: TaxTableRepository,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async calculateTax(taxableIncome: number, date: Date, frequency = 'MONTHLY', options?: Record<string, any>): Promise<number> {
      const result = await this.calculatePayrollTaxes(taxableIncome, date, frequency, options);
      return result.totalTax;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async calculatePayrollTaxes(taxableIncome: number, date: Date, frequency = 'MONTHLY', options?: Record<string, any>): Promise<PayrollTaxesResult> {
    const targetCountry = options ? options['countryCode'] || 'MX' : 'MX';
    const isr = await this.calculateIsrInternal(taxableIncome, date, frequency, targetCountry);

    return {
        totalTax: isr,
        details: [
            { name: 'Income Tax', amount: isr },
        ]
    };
  }

  private async calculateIsrInternal(taxableIncome: number, date: Date, frequency: string, country: string): Promise<number> {
    const income = new Decimal(taxableIncome);

    if (income.lessThanOrEqualTo(0)) {
      return 0;
    }

    const year = date.getFullYear();
    const type = frequency.toUpperCase();
    const cacheKey = `${country}-${year}-${type}`;

    let tables = this.cache.get(cacheKey);

    if (!tables) {
       tables = await this.repository.findForYear(year, type, country);
       if (!tables || tables.length === 0) {
         this.logger.warn(`No tax tables found for ${country} year ${year} and type ${type}. Returning 0 tax.`);
         return 0; // Return 0 instead of throwing to avoid breaking for countries without data yet.
       }
       // Sort tables by limit DESC
       tables.sort((a, b) => Number(b.limit) - Number(a.limit));
       this.cache.set(cacheKey, tables);
    }

    // Default to last row (lowest limit)
    let row = tables[tables.length - 1];

    for (const table of tables) {
      if (income.greaterThanOrEqualTo(table.limit)) {
        row = table;
        break;
      }
    }

    const excess = income.minus(row.limit);
    const taxOnExcess = excess.times(row.percent).dividedBy(100);
    const totalTax = taxOnExcess.plus(row.fixed);

    return totalTax.toDecimalPlaces(2).toNumber();
  }
}
