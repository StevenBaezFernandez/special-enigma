import { Injectable } from '@nestjs/common';
import { JournalEntry, JournalEntryRepository } from '@virteex/domain-accounting-domain';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class MikroOrmJournalEntryRepository implements JournalEntryRepository {
  constructor(private readonly em: EntityManager) {}

  async create(entry: JournalEntry): Promise<JournalEntry> {
    await this.em.persistAndFlush(entry);
    return entry;
  }

  async findById(id: string): Promise<JournalEntry | null> {
    return this.em.findOne(JournalEntry, { id }, { populate: ['lines'] });
  }

  async findAll(tenantId: string): Promise<JournalEntry[]> {
    return this.em.find(JournalEntry, { tenantId }, { populate: ['lines'] });
  }

  async count(tenantId: string): Promise<number> {
    return this.em.count(JournalEntry, { tenantId });
  }
}
