import { Injectable, Logger } from '@nestjs/common';
import { TaxService, PayrollTaxesResult } from '@virteex/payroll-domain';

@Injectable()
export class USPayrollStrategy implements TaxService {
  private readonly logger = new Logger(USPayrollStrategy.name);

  async calculateTax(taxableIncome: number, date: Date, frequency: string = 'MONTHLY'): Promise<number> {
    const result = await this.calculatePayrollTaxes(taxableIncome, date, frequency);
    // Return only Federal Tax for backward compatibility if needed, or total?
    // Usually calculateTax implies Income Tax.
    const federal = result.details.find(d => d.name === 'Federal Income Tax');
    return federal ? federal.amount : 0;
  }

  async calculatePayrollTaxes(taxableIncome: number, date: Date, frequency: string = 'MONTHLY'): Promise<PayrollTaxesResult> {
    // Simplified US Federal Tax calculation (Single Filer 2024 approximation)
    // Assuming taxableIncome is for the period.
    // We need to annualize it to apply brackets correctly.

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
      // Simplified cap at 24% for higher brackets
      annualFederalTax = 11600 * 0.10 + (35550 * 0.12) + (53375 * 0.22) + (annualIncome - 100525) * 0.24;
    }

    const federalTax = parseFloat((annualFederalTax / periods).toFixed(2));

    // FICA
    // Social Security: 6.2% up to $168,600 (2024 limit)
    const ssRate = 0.062;
    const ssLimit = 168600;
    const ssTaxable = Math.min(annualIncome, ssLimit) / periods;
    // Note: In real world, we track YTD. Here we assume per-period isolation for simplicity or assume constant salary.
    const socialSecurity = parseFloat((Math.min(taxableIncome, ssLimit/periods) * ssRate).toFixed(2));

    // Medicare: 1.45% (no limit)
    const medicareRate = 0.0145;
    const medicare = parseFloat((taxableIncome * medicareRate).toFixed(2));

    // State Tax (Placeholder - e.g. California ~6% average or 0 for now)
    // Ideally this comes from another strategy or config.
    const stateTaxRate = 0.05; // 5% Flat assumption for MVP robustness
    const stateTax = parseFloat((taxableIncome * stateTaxRate).toFixed(2));

    const totalTax = federalTax + socialSecurity + medicare + stateTax;

    return {
      totalTax,
      details: [
        { name: 'Federal Income Tax', amount: federalTax },
        { name: 'Social Security', amount: socialSecurity, rate: ssRate },
        { name: 'Medicare', amount: medicare, rate: medicareRate },
        { name: 'State Tax (Est.)', amount: stateTax, rate: stateTaxRate }
      ]
    };
  }
}
