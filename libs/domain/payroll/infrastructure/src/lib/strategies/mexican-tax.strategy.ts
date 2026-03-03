import { Injectable, Inject, Logger } from '@nestjs/common';
import { TaxService, TaxTableRepository, MissingTaxTableException, TAX_TABLE_REPOSITORY, TaxTable, PayrollTaxesResult } from '@virteex/domain-payroll-domain';
import { Decimal } from 'decimal.js';

@Injectable()
export class MexicanTaxStrategy implements TaxService {
  private readonly logger = new Logger(MexicanTaxStrategy.name);
  private readonly cache = new Map<string, TaxTable[]>();

  constructor(
    @Inject(TAX_TABLE_REPOSITORY)
    private readonly repository: TaxTableRepository,
  ) {}

  async calculateTax(taxableIncome: number, date: Date, frequency = 'MONTHLY', options?: Record<string, any>): Promise<number> {
      const result = await this.calculatePayrollTaxes(taxableIncome, date, frequency, options);
      return result.details.find(d => d.name === 'ISR')?.amount || 0;
  }

  async calculatePayrollTaxes(taxableIncome: number, date: Date, frequency = 'MONTHLY', options?: Record<string, any>): Promise<PayrollTaxesResult> {
    const isr = await this.calculateIsrInternal(taxableIncome, date, frequency);

    const uma = Number(options?.['uma']);
    if (!uma || isNaN(uma)) {
        this.logger.warn('UMA not provided in options. Using fallback 2024 value (108.57) but this should be configured.');
    }
    const finalUma = uma || 108.57;

    const imss = this.calculateImssInternal(taxableIncome, frequency, finalUma, options);

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
         this.logger.warn(`No tax tables found in DB for year ${year} and type ${type}. Checking for fallback seeds.`);
         if (year === 2024 || year === 2025) {
             tables = this.getFallbackTables(type);
         }
       }

       if (!tables || tables.length === 0) {
           this.logger.error(`No tax tables found for year ${year} and type ${type}`);
           throw new MissingTaxTableException(year, type);
       }
       tables.sort((a, b) => Number(b.limit) - Number(a.limit));
       this.cache.set(cacheKey, tables);
    }

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

  private calculateImssInternal(totalIncome: number, frequency: string, uma: number, options?: Record<string, any>): number {
      let days = 15;
      if (frequency === 'MONTHLY') days = 30;
      if (frequency === 'WEEKLY') days = 7;
      if (frequency === 'BIWEEKLY') days = 14;
      if (frequency === 'SEMIMONTHLY') days = 15.2;

      if (options?.['daysPerPeriod']) {
          days = Number(options['daysPerPeriod']);
      }

      const dailySbc = totalIncome / days;

      const imssBaseRate = options?.['imssBaseRate'] ? Number(options['imssBaseRate']) : 0.02375;
      const imssExcessRate = options?.['imssExcessRate'] ? Number(options['imssExcessRate']) : 0.004;

      let imss = totalIncome * imssBaseRate;

      const limitExcedente = 3 * uma;
      if (dailySbc > limitExcedente) {
          const excedenteDaily = (dailySbc - limitExcedente);
          const excedenteTotal = excedenteDaily * days;
          imss += excedenteTotal * imssExcessRate;
      }

      return Number(imss.toFixed(2));
  }

  private getFallbackTables(type: string): TaxTable[] {
      if (type === 'MONTHLY') {
          return [
            { limit: 0.01, fixed: 0.00, percent: 1.92, year: 2024, type: 'MONTHLY', country: 'MX', id: '1' } as TaxTable,
            { limit: 746.05, fixed: 14.32, percent: 6.40, year: 2024, type: 'MONTHLY', country: 'MX', id: '2' } as TaxTable,
            { limit: 6332.06, fixed: 371.83, percent: 10.88, year: 2024, type: 'MONTHLY', country: 'MX', id: '3' } as TaxTable,
            { limit: 11128.02, fixed: 893.63, percent: 16.00, year: 2024, type: 'MONTHLY', country: 'MX', id: '4' } as TaxTable,
            { limit: 12935.83, fixed: 1182.88, percent: 17.92, year: 2024, type: 'MONTHLY', country: 'MX', id: '5' } as TaxTable,
            { limit: 15487.72, fixed: 1640.18, percent: 21.36, year: 2024, type: 'MONTHLY', country: 'MX', id: '6' } as TaxTable,
            { limit: 31236.50, fixed: 5004.12, percent: 23.52, year: 2024, type: 'MONTHLY', country: 'MX', id: '7' } as TaxTable,
            { limit: 49233.01, fixed: 9236.89, percent: 30.00, year: 2024, type: 'MONTHLY', country: 'MX', id: '8' } as TaxTable,
            { limit: 93993.91, fixed: 22665.17, percent: 32.00, year: 2024, type: 'MONTHLY', country: 'MX', id: '9' } as TaxTable,
            { limit: 125325.21, fixed: 32691.18, percent: 34.00, year: 2024, type: 'MONTHLY', country: 'MX', id: '10' } as TaxTable,
            { limit: 375975.62, fixed: 117912.32, percent: 35.00, year: 2024, type: 'MONTHLY', country: 'MX', id: '11' } as TaxTable,
          ];
      }
      return [];
  }
}
