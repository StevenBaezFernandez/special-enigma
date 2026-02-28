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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async calculateIsr(taxableIncome: number, year: number, country = 'MX', periodType: 'MONTHLY' | 'ANNUAL' = 'MONTHLY', options?: Record<string, any>): Promise<number> {
      const strategy = this.strategyFactory.getStrategy(country);
      const date = new Date(year, 0, 1);
      // Pass country in options so generic strategy knows which country context applies
      const taxOptions = { ...options, country, countryCode: country };
      return strategy.calculateTax(taxableIncome, date, periodType, taxOptions);
  }

  /**
   * @deprecated Use TaxStrategy.calculatePayrollTaxes instead.
   */
  calculateImss(sbc: number, days = 15, uma = 108.57, country = 'MX'): number {
      this.logger.warn('calculateImss is deprecated and contains hardcoded logic. Use calculatePayrollTaxes instead.');
      if (country !== 'MX') {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async calculatePayrollTaxes(income: number, country: string, date: Date, frequency = 'MONTHLY', options?: Record<string, any>): Promise<PayrollTaxesResult> {
      const strategy = this.strategyFactory.getStrategy(country);
      // Pass country in options so generic strategy knows which country context applies
      const taxOptions = { ...options, country, countryCode: country };
      return strategy.calculatePayrollTaxes(income, date, frequency, taxOptions);
  }
}
