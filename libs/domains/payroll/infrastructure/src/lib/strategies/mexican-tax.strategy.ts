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

  async calculateTax(taxableIncome: number, date: Date, frequency: string = 'MONTHLY'): Promise<number> {
    const income = new Decimal(taxableIncome);

    if (income.lessThanOrEqualTo(0)) {
      return 0;
    }

    const year = date.getFullYear();
    const type = frequency.toUpperCase();

    const tables = await this.repository.findForYear(year, type);
    if (!tables || tables.length === 0) {
      this.logger.error(`No tax tables found for year ${year} and type ${type}`);
      throw new MissingTaxTableException(year, type);
    }

    // Tables must be sorted by limit DESC in repository logic or sort here.
    // Assuming repository returns sorted or we sort.
    // Let's sort to be safe: DESC
    tables.sort((a, b) => Number(b.limit) - Number(a.limit));

    let row = tables[tables.length - 1]; // Default to lowest bracket (last one in DESC sort usually has limit 0.01)

    // Logic: find first row where income >= limit
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
