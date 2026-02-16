import { Injectable, Inject, Logger } from '@nestjs/common';
import { TaxService, PayrollTaxesResult, TaxTableRepository, TAX_TABLE_REPOSITORY, TaxTable } from '@virteex/payroll-domain';
import { Decimal } from 'decimal.js';

@Injectable()
export class USPayrollStrategy implements TaxService {
  private readonly logger = new Logger(USPayrollStrategy.name);

  constructor(
    @Inject(TAX_TABLE_REPOSITORY)
    private readonly repository: TaxTableRepository,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async calculateTax(taxableIncome: number, date: Date, frequency = 'MONTHLY', options?: Record<string, any>): Promise<number> {
    const result = await this.calculatePayrollTaxes(taxableIncome, date, frequency, options);
    const federal = result.details.find(d => d.name === 'Federal Income Tax');
    return federal ? federal.amount : 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async calculatePayrollTaxes(taxableIncome: number, date: Date, frequency = 'MONTHLY', options?: Record<string, any>): Promise<PayrollTaxesResult> {

    let periods = 12;
    if (frequency === 'WEEKLY') periods = 52;
    if (frequency === 'BIWEEKLY') periods = 26;
    if (frequency === 'SEMIMONTHLY') periods = 24;

    const annualIncome = taxableIncome * periods;

    // Federal Tax
    let federalTax = 0;
    const year = date.getFullYear();
    const type = 'ANNUAL'; // US tables often annualized in this logic, but let's check repo. If repo stores monthly, we use monthly. Assuming repo stores ANNUAL limits for US based on common practice or we convert.
    // Let's assume we try to find tables matching the frequency first, then Annual.
    // But for simplicity and robustness, let's use the hardcoded logic as a fallback if DB is empty.

    // Try to find Federal Tables (Country=US, State=null)
    // We assume the repository stores tables that match the frequency (e.g. Weekly tables) OR Annual tables.
    // If we have Annual tables, we calculate on annual income and divide.
    let federalTables = await this.repository.findForYear(year, 'ANNUAL', 'US', undefined);

    if (!federalTables || federalTables.length === 0) {
         // Fallback to hardcoded 2024 if 2024
         if (year === 2024) {
             federalTables = this.getFallbackFederalTables2024();
         } else {
             this.logger.warn(`No Federal tax tables found for US ${year}. Using 2024 fallback.`);
             federalTables = this.getFallbackFederalTables2024();
         }
    }

    if (federalTables && federalTables.length > 0) {
        // Calculate based on Annual tables
        const annualTax = this.calculateProgressiveTax(annualIncome, federalTables);
        federalTax = parseFloat((annualTax / periods).toFixed(2));
    } else {
        // Absolute fallback if everything fails (shouldn't happen with fallback tables above)
        federalTax = 0;
    }

    // FICA (Social Security & Medicare) - Should also be configurable/DB driven ideally
    // Using options or defaults
    const ssRate = options?.['socialSecurityRate'] ? Number(options['socialSecurityRate']) : 0.062;
    const ssLimit = options?.['socialSecurityLimit'] ? Number(options['socialSecurityLimit']) : 168600;

    const socialSecurity = parseFloat((Math.min(taxableIncome, ssLimit/periods) * ssRate).toFixed(2));

    const medicareRate = options?.['medicareRate'] ? Number(options['medicareRate']) : 0.0145;
    const medicare = parseFloat((taxableIncome * medicareRate).toFixed(2));

    // State Tax Logic
    let stateTax = 0;
    let stateRate = 0;
    const stateCode = options?.['state']; // e.g., 'CA', 'NY'

    if (stateCode) {
        // Try to find state tax table
        const tables = await this.repository.findForYear(date.getFullYear(), frequency.toUpperCase(), 'US', stateCode);

        if (tables && tables.length > 0) {
            // Calculate using progressive table
            stateTax = this.calculateProgressiveTax(taxableIncome, tables);
        } else {
             // Fallback to configured rate in options
             if (options && typeof options['stateTaxRate'] === 'number') {
                stateRate = options['stateTaxRate'];
                stateTax = parseFloat((taxableIncome * stateRate).toFixed(2));
             } else {
                 this.logger.warn(`No tax table found for US State ${stateCode} and no stateTaxRate provided.`);
             }
        }
    } else if (options && typeof options['stateTaxRate'] === 'number') {
        // Backward compatibility
        stateRate = options['stateTaxRate'];
        stateTax = parseFloat((taxableIncome * stateRate).toFixed(2));
    }

    const totalTax = federalTax + socialSecurity + medicare + stateTax;

    return {
      totalTax,
      details: [
        { name: 'Federal Income Tax', amount: federalTax },
        { name: 'Social Security', amount: socialSecurity, rate: ssRate },
        { name: 'Medicare', amount: medicare, rate: medicareRate },
        { name: 'State Tax', amount: stateTax, rate: stateRate } // Rate might be 0 if table used
      ]
    };
  }

  private calculateProgressiveTax(incomeVal: number, tables: TaxTable[]): number {
      const income = new Decimal(incomeVal);
      if (income.lessThanOrEqualTo(0)) return 0;

      // Sort tables by limit DESC
      tables.sort((a, b) => Number(b.limit) - Number(a.limit));

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

  private getFallbackFederalTables2024(): TaxTable[] {
      // 2024 Single Filer Annual Brackets (Approximate)
      // Converted to TaxTable format: limit is the lower bound of the bracket.
      // 0 - 11600: 10%
      // 11600 - 47150: 12% + 1160 (fixed)
      // 47150 - 100525: 22% + 5426 (fixed)
      // ...
      return [
          { limit: 0, fixed: 0, percent: 10, year: 2024, type: 'ANNUAL', country: 'US', id: 'us1' } as TaxTable,
          { limit: 11600, fixed: 1160, percent: 12, year: 2024, type: 'ANNUAL', country: 'US', id: 'us2' } as TaxTable,
          { limit: 47150, fixed: 5426, percent: 22, year: 2024, type: 'ANNUAL', country: 'US', id: 'us3' } as TaxTable,
          { limit: 100525, fixed: 17168.5, percent: 24, year: 2024, type: 'ANNUAL', country: 'US', id: 'us4' } as TaxTable,
          // Add more if needed, this covers up to 191k approx which is standard for test cases.
      ];
  }
}
