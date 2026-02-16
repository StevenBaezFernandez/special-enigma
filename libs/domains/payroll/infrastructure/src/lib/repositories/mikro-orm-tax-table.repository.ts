import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { TaxTable, TaxTableRepository } from '@virteex/payroll-domain';

@Injectable()
export class MikroOrmTaxTableRepository implements TaxTableRepository {
  constructor(
    @InjectRepository(TaxTable)
    private readonly repository: EntityRepository<TaxTable>
  ) {}

  async findForYear(year: number, type: string, country = 'MX', state?: string): Promise<TaxTable[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { year, type, country };

    if (state) {
      where.state = state;
    } else {
      // Explicitly look for null state (federal/national level) if no state provided
      where.state = null;
    }

    return this.repository.find(where);
  }

  // Extra method not in interface but useful for seeding/tests
  async save(taxTable: TaxTable): Promise<void> {
    await this.repository.getEntityManager().persistAndFlush(taxTable);
  }
}
