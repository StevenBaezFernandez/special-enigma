import { Injectable, Inject, Logger } from '@nestjs/common';
import { TaxService, TaxTableRepository, MissingTaxTableException, TAX_TABLE_REPOSITORY, TaxTable } from '@virteex/payroll-domain';
import { Decimal } from 'decimal.js';

@Injectable()
export class MexicanTaxStrategy implements TaxService {
  private readonly logger = new Logger(MexicanTaxStrategy.name);
  private readonly cache = new Map<string, TaxTable[]>();

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
    const cacheKey = `${year}-${type}`;

    let tables = this.cache.get(cacheKey);

    if (!tables) {
       tables = await this.repository.findForYear(year, type);
       if (!tables || tables.length === 0) {
         this.logger.error(`No tax tables found for year ${year} and type ${type}`);
         throw new MissingTaxTableException(year, type);
       }
       // Sort tables by limit DESC so we can find the correct bracket
       tables.sort((a, b) => Number(b.limit) - Number(a.limit));
       this.cache.set(cacheKey, tables);
       this.logger.debug(`Cached tax tables for ${cacheKey}`);
    }

    // Default to lowest bracket (last one in DESC sort, usually has limit 0.01)
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
