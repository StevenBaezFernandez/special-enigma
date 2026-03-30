import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/knex';
import { IAccountingReportingPort } from '@virteex/domain-accounting-contracts';
import { JournalEntry } from '@virteex/domain-accounting-domain';

@Injectable()
export class MikroOrmReportingAdapter implements IAccountingReportingPort {
  constructor(private readonly em: EntityManager) {}

  async countJournalEntries(tenantId: string): Promise<number> {
    return this.em.count(JournalEntry, { tenantId });
  }
}
