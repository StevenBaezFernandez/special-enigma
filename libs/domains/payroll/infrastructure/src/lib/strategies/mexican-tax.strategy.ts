import { Injectable, Inject, Logger } from '@nestjs/common';
import { TaxService, TaxTableRepository, MissingTaxTableException, TAX_TABLE_REPOSITORY, TaxTable, PayrollTaxesResult } from '@virteex/payroll-domain';
import { Decimal } from 'decimal.js';

@Injectable()
export class MexicanTaxStrategy implements TaxService {
  private readonly logger = new Logger(MexicanTaxStrategy.name);
  private readonly cache = new Map<string, TaxTable[]>();

  constructor(
    @Inject(TAX_TABLE_REPOSITORY)
    private readonly repository: TaxTableRepository,
  ) {}

  async calculateTax(taxableIncome: number, date: Date, frequency: string = 'MONTHLY'): Promise<number> {
      const result = await this.calculatePayrollTaxes(taxableIncome, date, frequency);
      return result.details.find(d => d.name === 'ISR')?.amount || 0;
  }

  async calculatePayrollTaxes(taxableIncome: number, date: Date, frequency: string = 'MONTHLY'): Promise<PayrollTaxesResult> {
    const isr = await this.calculateIsrInternal(taxableIncome, date, frequency);

    // IMSS Logic
    // We assume taxableIncome is the total income for the period.
    const imss = this.calculateImssInternal(taxableIncome, frequency);

    return {
        totalTax: isr + imss,
        details: [
            { name: 'ISR', amount: isr },
            { name: 'IMSS', amount: imss }
        ]
    };
  }

  private async calculateIsrInternal(taxableIncome: number, date: Date, frequency: string): Promise<number> {
    const income = new Decimal(taxableIncome);

    if (income.lessThanOrEqualTo(0)) {
      return 0;
    }

    const year = date.getFullYear();
    const type = frequency.toUpperCase();
    const cacheKey = `${year}-${type}`;

    let tables = this.cache.get(cacheKey);

    if (!tables) {
       tables = await this.repository.findForYear(year, type);
       if (!tables || tables.length === 0) {
         this.logger.error(`No tax tables found for year ${year} and type ${type}`);
         return 0;
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

  private calculateImssInternal(totalIncome: number, frequency: string): number {
      // Approximate days based on frequency for daily rate calculation
      let days = 15;
      if (frequency === 'MONTHLY') days = 30;
      if (frequency === 'WEEKLY') days = 7;
      if (frequency === 'BIWEEKLY') days = 14;

      const uma = 108.57; // 2024 Value
      const dailySbc = totalIncome / days;

      // Base: 2.375% of Total SBC (Employee Share)
      let imss = totalIncome * 0.02375;

      const limitExcedente = 3 * uma;
      if (dailySbc > limitExcedente) {
          const excedenteDaily = (dailySbc - limitExcedente);
          const excedenteTotal = excedenteDaily * days;
          imss += excedenteTotal * 0.004;
      }

      return Number(imss.toFixed(2));
  }
}
