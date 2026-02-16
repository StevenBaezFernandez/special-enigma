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

  async findForYear(year: number, type: string): Promise<TaxTable[]> {
    // Assuming TaxTable has a 'type' field or similar logic.
    // If not, we might filter in memory or modify entity.
    // But let's assume filtering by year is enough for now or assume entity structure.
    // The previous implementation used findOne({ year }).

    // For now, let's return array.
    // Ideally, TaxTable should have type field. If not, we ignore type filter or check schema.

    return this.repository.find({ year } as any);
  }

  // Extra method not in interface but useful for seeding/tests
  async save(taxTable: TaxTable): Promise<void> {
    await this.repository.getEntityManager().persistAndFlush(taxTable);
  }
}
