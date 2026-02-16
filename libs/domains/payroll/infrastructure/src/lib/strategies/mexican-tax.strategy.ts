import { Injectable, Inject, Logger } from '@nestjs/common';
import { TaxService, TaxTableRepository, MissingTaxTableException, TAX_TABLE_REPOSITORY } from '@virteex/payroll-domain';
import { Decimal } from 'decimal.js';

@Injectable()
export class MexicanTaxStrategy implements TaxService {
  private readonly logger = new Logger(MexicanTaxStrategy.name);

  constructor(
    @Inject(TAX_TABLE_REPOSITORY)
    private readonly repository: TaxTableRepository,
  ) {}

  async calculateTax(taxableIncome: number, date: Date): Promise<number> {
    const income = new Decimal(taxableIncome);

    if (income.lessThanOrEqualTo(0)) {
      return 0;
    }

    const year = date.getFullYear();
    // Default to MONTHLY tables for now as per payroll type assumption
    const type = 'MONTHLY';

    const tables = await this.repository.findForYear(year, type);
    if (!tables || tables.length === 0) {
      this.logger.error(`No tax tables found for year ${year}`);
      throw new MissingTaxTableException(year, type);
    }

    // Tables are sorted DESC by limit
    // Find the first row where income >= limit
    let row = tables[tables.length - 1]; // Default to lowest bracket
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
