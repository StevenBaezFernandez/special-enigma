import { Injectable, Inject, Logger } from '@nestjs/common';
import { TaxService, type TaxTableRepository, TAX_TABLE_REPOSITORY, TaxTable, PayrollTaxesResult } from '@virteex/domain-payroll-domain';
import { Decimal } from 'decimal.js';

@Injectable()
export class GenericLatamStrategy implements TaxService {
  private readonly logger = new Logger(GenericLatamStrategy.name);
  private readonly cache = new Map<string, TaxTable[]>();

  constructor(
    @Inject(TAX_TABLE_REPOSITORY)
    private readonly repository: TaxTableRepository,
  ) {}

  async calculateTax(taxableIncome: number, date: Date, frequency = 'MONTHLY', options?: Record<string, any>): Promise<number> {
      const result = await this.calculatePayrollTaxes(taxableIncome, date, frequency, options);
      return result.totalTax;
  }

  async calculatePayrollTaxes(taxableIncome: number, date: Date, frequency = 'MONTHLY', options?: Record<string, any>): Promise<PayrollTaxesResult> {
    const country = options?.['countryCode'] || 'MX';
    const income = new Decimal(taxableIncome);

    const isr = await this.calculateIsrInternal(taxableIncome, date, frequency, country);
    const result: PayrollTaxesResult = {
        totalTax: isr,
        details: [
            { name: 'Income Tax', amount: isr },
        ]
    };

    if (country === 'CO') {
      this.applyColombiaSocialSecurity(income, result);
    } else if (country === 'BR') {
      this.applyBrazilSocialSecurity(income, result);
    }

    return result;
  }

  private applyColombiaSocialSecurity(income: Decimal, result: PayrollTaxesResult): void {
    // Colombia Social Security (Employee portion: Health 4%, Pension 4%)
    // Minimum Wage (SMLV) 2024: 1,300,000 COP approx.
    const smlv = new Decimal(1300000);
    const ibc = income.greaterThan(smlv.times(25)) ? smlv.times(25) : income; // Cap at 25 SMLV

    if (ibc.lessThan(smlv)) return;

    const health = ibc.times(0.04).toDecimalPlaces(0).toNumber();
    const pension = ibc.times(0.04).toDecimalPlaces(0).toNumber();

    result.details.push({ name: 'Salud (CO)', amount: health });
    result.details.push({ name: 'Pensión (CO)', amount: pension });

    // Solidarity fund if > 4 SMLV
    if (income.greaterThan(smlv.times(4))) {
      const solidarity = income.times(0.01).toDecimalPlaces(0).toNumber();
      result.details.push({ name: 'Fondo de Solidaridad Pensional (CO)', amount: solidarity });
    }
  }

  private applyBrazilSocialSecurity(income: Decimal, result: PayrollTaxesResult): void {
    // Brazil INSS 2024 progressive rates
    // 0 - 1412.00: 7.5%
    // 1412.01 - 2666.68: 9%
    // 2666.69 - 4000.03: 12%
    // 4000.04 - 7786.02: 14%
    // Teto INSS 2024: 7786.02

    const teto = new Decimal(7786.02);
    const applicableIncome = income.greaterThan(teto) ? teto : income;

    let inss = new Decimal(0);
    const tiers = [
      { limit: new Decimal(1412.00), rate: 0.075 },
      { limit: new Decimal(2666.68), rate: 0.09 },
      { limit: new Decimal(4000.03), rate: 0.12 },
      { limit: new Decimal(7786.02), rate: 0.14 },
    ];

    let previousLimit = new Decimal(0);
    for (const tier of tiers) {
      if (applicableIncome.greaterThan(previousLimit)) {
        const range = Decimal.min(applicableIncome, tier.limit).minus(previousLimit);
        inss = inss.plus(range.times(tier.rate));
        previousLimit = tier.limit;
      } else {
        break;
      }
    }

    result.details.push({ name: 'INSS (BR)', amount: inss.toDecimalPlaces(2).toNumber() });
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
         return 0;
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
}
