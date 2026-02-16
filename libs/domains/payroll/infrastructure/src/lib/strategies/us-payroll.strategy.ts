import { Injectable, Logger } from '@nestjs/common';
import { TaxService } from '@virteex/payroll-domain';

@Injectable()
export class USPayrollStrategy implements TaxService {
  private readonly logger = new Logger(USPayrollStrategy.name);

  async calculateTax(taxableIncome: number, date: Date): Promise<number> {
    // Simplified US Federal Tax calculation (Single Filer 2024 approximation)
    // Assuming taxableIncome is monthly.
    const annualIncome = taxableIncome * 12;
    let annualTax = 0;

    // Brackets:
    // 10% on income between $0 and $11,600
    // 12% on income between $11,600 and $47,150
    // 22% on income between $47,150 and $100,525

    if (annualIncome <= 11600) {
      annualTax = annualIncome * 0.10;
    } else if (annualIncome <= 47150) {
      annualTax = 11600 * 0.10 + (annualIncome - 11600) * 0.12;
    } else {
      // Cap at 22% for simplicity in this MVP
      annualTax = 11600 * 0.10 + (47150 - 11600) * 0.12 + (annualIncome - 47150) * 0.22;
    }

    return parseFloat((annualTax / 12).toFixed(2));
  }
}
