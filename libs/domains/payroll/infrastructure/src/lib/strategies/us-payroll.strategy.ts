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
    // Simplified US Federal Tax calculation (Single Filer 2024 approximation)
    // We keep the hardcoded logic for Federal as a baseline, but ideally this should also be table-driven.

    let periods = 12;
    if (frequency === 'WEEKLY') periods = 52;
    if (frequency === 'BIWEEKLY') periods = 26;
    if (frequency === 'SEMIMONTHLY') periods = 24;

    const annualIncome = taxableIncome * periods;
    let annualFederalTax = 0;

    // 2024 Single Filer Brackets (Approximate)
    if (annualIncome <= 11600) {
      annualFederalTax = annualIncome * 0.10;
    } else if (annualIncome <= 47150) {
      annualFederalTax = 11600 * 0.10 + (annualIncome - 11600) * 0.12;
    } else if (annualIncome <= 100525) {
      annualFederalTax = 11600 * 0.10 + (35550 * 0.12) + (annualIncome - 47150) * 0.22;
    } else {
      annualFederalTax = 11600 * 0.10 + (35550 * 0.12) + (53375 * 0.22) + (annualIncome - 100525) * 0.24;
    }

    const federalTax = parseFloat((annualFederalTax / periods).toFixed(2));

    // FICA
    const ssRate = 0.062;
    const ssLimit = 168600;
    const socialSecurity = parseFloat((Math.min(taxableIncome, ssLimit/periods) * ssRate).toFixed(2));

    const medicareRate = 0.0145;
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
}
