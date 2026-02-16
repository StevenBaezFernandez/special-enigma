import { Injectable, Inject, Logger } from '@nestjs/common';
import { TaxStrategyFactory, TAX_STRATEGY_FACTORY } from '../ports/tax-strategy.factory';
import { PayrollTaxesResult } from '../ports/tax-service.port';

@Injectable()
export class PayrollCalculationService {
  private readonly logger = new Logger(PayrollCalculationService.name);

  constructor(
    @Inject(TAX_STRATEGY_FACTORY) private readonly strategyFactory: TaxStrategyFactory
  ) {}

  /**
   * Calculates the proportional salary for a given period, considering incidences.
   * Uses standard daily salary (monthly / 30) as per Mexican labor law common practice.
   * @todo Refactor to be configurable per country/tenant policy.
   */
  calculateProportionalSalary(monthlySalary: number, start: Date, end: Date, incidenceDays = 0): number {
    const daysInPeriod = this.calculateDays(start, end);
    const payableDays = daysInPeriod - incidenceDays;

    if (payableDays < 0) return 0;

    const dailySalary = monthlySalary / 30;
    return Number((dailySalary * payableDays).toFixed(2));
  }

  calculateDays(start: Date, end: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    // Round to nearest integer to avoid DST issues
    return Math.round(Math.abs((end.getTime() - start.getTime()) / oneDay)) + 1;
  }

  async calculateIsr(taxableIncome: number, year: number, country: string = 'MX', periodType: 'MONTHLY' | 'ANNUAL' = 'MONTHLY'): Promise<number> {
      const strategy = this.strategyFactory.getStrategy(country);
      const date = new Date(year, 0, 1);
      return strategy.calculateTax(taxableIncome, date, periodType);
  }

  calculateImss(sbc: number, days: number = 15, uma: number = 108.57, country: string = 'MX'): number {
      // This is legacy/specific to Mexico.
      // Ideally should be handled by calculatePayrollTaxes strategy.
      if (country !== 'MX') {
          this.logger.warn(`calculateImss called for non-MX country: ${country}. Returning 0.`);
          return 0;
      }

      const sbcTotal = sbc * days;
      let imss = sbcTotal * 0.02375;

      const limitExcedente = 3 * uma;
      if (sbc > limitExcedente) {
          const excedente = (sbc - limitExcedente) * days;
          imss += excedente * 0.004;
      }

      return Number(imss.toFixed(2));
  }

  /**
   * Unified method to calculate all payroll taxes/deductions based on country strategy.
   */
  async calculatePayrollTaxes(income: number, country: string, date: Date, frequency: string = 'MONTHLY'): Promise<PayrollTaxesResult> {
      const strategy = this.strategyFactory.getStrategy(country);
      return strategy.calculatePayrollTaxes(income, date, frequency);
  }
}
