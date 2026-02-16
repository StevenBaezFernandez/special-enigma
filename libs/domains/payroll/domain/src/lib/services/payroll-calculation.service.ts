import { Injectable, Inject, Logger } from '@nestjs/common';
import { TaxTableRepository, TAX_TABLE_REPOSITORY } from '../repositories/tax-table.repository';
import { TaxTable } from '../entities/tax-table.entity';

@Injectable()
export class PayrollCalculationService {
  private readonly logger = new Logger(PayrollCalculationService.name);

  constructor(
    @Inject(TAX_TABLE_REPOSITORY) private readonly taxTableRepo: TaxTableRepository
  ) {}

  /**
   * Calculates the proportional salary for a given period, considering incidences.
   * Uses standard daily salary (monthly / 30) as per Mexican labor law common practice.
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

  async calculateIsr(taxableIncome: number, year: number, periodType: 'MONTHLY' | 'ANNUAL' = 'MONTHLY'): Promise<number> {
      const tables = await this.taxTableRepo.findForYear(year, periodType);
      if (!tables || tables.length === 0) {
          this.logger.warn(`No ISR tables found for year ${year}. Returning 0.`);
          return 0;
      }

      const sortedTables = tables.sort((a, b) => Number(a.limit) - Number(b.limit));
      let applicableRow: TaxTable | null = null;

      for (const row of sortedTables) {
          if (Number(row.limit) <= taxableIncome) {
              applicableRow = row;
          } else {
              break;
          }
      }

      if (!applicableRow) return 0;

      const base = taxableIncome - Number(applicableRow.limit);
      const tax = Number(applicableRow.fixed) + (base * Number(applicableRow.percent) / 100);

      return Number(tax.toFixed(2));
  }

  calculateImss(sbc: number, days: number = 15, uma: number = 108.57): number {
      const sbcTotal = sbc * days;
      // Base quotas (Employee share)
      // Enf. Mat. (Dinero): 0.25%
      // Inv. Vida: 0.625%
      // Cesantía/Vejez: 1.125%
      // Total Base: 2.000% (Wait, commonly cited as ~2.375% includes Excendente?)

      // Let's use precise:
      // Gastos Médicos (Excedente 3 UMA): 0.40%
      // Prestaciones en Dinero: 0.25%
      // Pensiones y Beneficiarios: 0.375%
      // Invalidez y Vida: 0.625%
      // Cesantía y Vejez: 1.125%

      // Sum without Excedente: 0.25 + 0.375 + 0.625 + 1.125 = 2.375%
      // Yes, 2.375% is correct for base up to limit.

      let imss = sbcTotal * 0.02375;

      const limitExcedente = 3 * uma;
      if (sbc > limitExcedente) {
          const excedente = (sbc - limitExcedente) * days;
          imss += excedente * 0.004; // 0.40% additional
      }

      return Number(imss.toFixed(2));
  }
}
