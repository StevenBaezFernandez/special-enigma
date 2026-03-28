import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { JournalEntry, type JournalEntryRepository, JournalEntryType } from '@virteex/domain-accounting-domain';

@Injectable()
export class MikroOrmJournalEntryRepository implements JournalEntryRepository {
  constructor(private readonly em: EntityManager) {}

  async create(entry: JournalEntry): Promise<JournalEntry> {
    await this.em.persistAndFlush(entry);
    return entry;
  }

  async findById(id: string): Promise<JournalEntry | null> {
    return this.em.findOne(JournalEntry, { id } as any, { populate: ['lines'] });
  }

  async findAll(tenantId: string): Promise<JournalEntry[]> {
    return this.em.find(JournalEntry, { tenantId } as any, { populate: ['lines'] });
  }

  async count(tenantId: string): Promise<number> {
    return this.em.count(JournalEntry, { tenantId } as any);
  }

  async getBalancesByAccount(tenantId: string, startDate?: Date, endDate?: Date, dimensions?: Record<string, string>): Promise<Map<string, { debit: string; credit: string }>> {
    const qb = (this.em as any).createQueryBuilder('JournalEntryLine', 'l');
    qb.select(['l.account_id', 'SUM(l.debit) as total_debit', 'SUM(l.credit) as total_credit'])
      .join('l.journalEntry', 'e')
      .where({ 'e.tenantId': tenantId });

    if (startDate) qb.andWhere('e.date >= ?', [startDate]);
    if (endDate) qb.andWhere('e.date <= ?', [endDate]);

    if (dimensions) {
        Object.entries(dimensions).forEach(([key, value]) => {
            if (!/^[a-zA-Z0-9_]+$/.test(key)) {
                throw new Error(`Invalid dimension key: ${key}`);
            }
            qb.andWhere(`e.dimensions->>'${key}' = ?`, [value]);
        });
    }

    qb.groupBy('l.account_id');

    const results: { account_id: string; total_debit: string; total_credit: string }[] = await qb.execute();
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
      } as any,
      {
        orderBy: { date: 'DESC' } as any,
      }
    );

    return latestClosing ? latestClosing.date : null;
  }
}
