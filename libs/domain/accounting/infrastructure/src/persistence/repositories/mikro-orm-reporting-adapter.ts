import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/knex';
import { IAccountingReportingPort } from '@virteex/domain-accounting-contracts';
import {
  AccountType,
  JournalEntry,
  JournalEntryLine,
} from '@virteex/domain-accounting-domain';

@Injectable()
export class MikroOrmReportingAdapter implements IAccountingReportingPort {
  constructor(private readonly em: EntityManager) {}

  async countJournalEntries(tenantId: string): Promise<number> {
    return this.em.count(JournalEntry, { tenantId });
  }

  async getMonthlyOpex(tenantId: string): Promise<number> {
    const now = new Date();
    const firstDayOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );

    const rows = await this.em
      .createQueryBuilder(JournalEntryLine, 'line')
      .select([
        'coalesce(sum(cast(line.debit as numeric)), 0) as totalDebit',
        'coalesce(sum(cast(line.credit as numeric)), 0) as totalCredit',
      ])
      .join('line.journalEntry', 'entry')
      .join('line.account', 'account')
      .where({
        'entry.tenantId': tenantId,
        'entry.date': { $gte: firstDayOfMonth, $lte: now },
        'account.type': AccountType.EXPENSE,
      })
      .execute<{ totalDebit: string; totalCredit: string }>('get');

    const totalDebit = Number(rows?.totalDebit ?? 0);
    const totalCredit = Number(rows?.totalCredit ?? 0);

    return totalDebit - totalCredit;
  }
}
