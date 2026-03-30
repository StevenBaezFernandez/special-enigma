import { Injectable } from '@nestjs/common';
import { QueryOrder } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/knex';
import { JournalEntry, type JournalEntryRepository, JournalEntryType, JournalEntryLine } from '@virteex/domain-accounting-domain';
import { DimensionValidator } from '@virteex/domain-accounting-application';

@Injectable()
export class JournalEntryRepositoryAdapter implements JournalEntryRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly dimensionValidator: DimensionValidator
  ) {}

  async create(entry: JournalEntry): Promise<JournalEntry> {
    await this.em.persistAndFlush(entry);
    return entry;
  }

  async findById(tenantId: string, id: string): Promise<JournalEntry | null> {
    return this.em.findOne(JournalEntry, { id, tenantId }, { populate: ['lines'] });
  }

  async findAll(tenantId: string): Promise<JournalEntry[]> {
    return this.em.find(JournalEntry, { tenantId }, { populate: ['lines'] });
  }

  async count(tenantId: string): Promise<number> {
    return this.em.count(JournalEntry, { tenantId });
  }

  async getBalancesByAccount(tenantId: string, startDate?: Date, endDate?: Date, dimensions?: Record<string, string>, accountIds?: string[]): Promise<Map<string, { debit: string; credit: string }>> {
    const qb = this.em.createQueryBuilder(JournalEntryLine, 'l');
    qb.select(['l.account_id', 'SUM(l.debit) as total_debit', 'SUM(l.credit) as total_credit'])
      .join('l.journalEntry', 'e')
      .where({ 'e.tenantId': tenantId });

    if (startDate) qb.andWhere('e.date >= ?', [startDate]);
    if (endDate) qb.andWhere('e.date <= ?', [endDate]);
    if (accountIds && accountIds.length > 0) qb.andWhere({ 'l.account_id': { $in: accountIds } });

    if (dimensions) {
        Object.entries(dimensions).forEach(([key, value]) => {
            this.dimensionValidator.ensureValidKey(key);
            qb.andWhere(`e.dimensions->>'${key}' = ?`, [value]);
        });
    }

    qb.groupBy('l.account_id');

    const results = await qb.execute<{ account_id: string; total_debit: string; total_credit: string }[]>();
    const balanceMap = new Map<string, { debit: string; credit: string }>();

    results.forEach((row) => {
        balanceMap.set(row.account_id, {
            debit: row.total_debit || '0',
            credit: row.total_credit || '0'
        });
    });

    return balanceMap;
  }

  async findLatestClosedDate(tenantId: string): Promise<Date | null> {
    const latestClosing = await this.em.findOne(
      JournalEntry,
      {
        tenantId,
        type: JournalEntryType.CLOSING,
      },
      {
        orderBy: { date: QueryOrder.DESC },
      }
    );

    return latestClosing ? latestClosing.date : null;
  }
}
