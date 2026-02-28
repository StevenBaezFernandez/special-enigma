import { JournalEntry } from '../entities/journal-entry.entity';

export interface JournalEntryRepository {
  create(entry: JournalEntry): Promise<JournalEntry>;
  findById(id: string): Promise<JournalEntry | null>;
  findAll(tenantId: string): Promise<JournalEntry[]>;
  count(tenantId: string): Promise<number>;
}

export const JOURNAL_ENTRY_REPOSITORY = 'JOURNAL_ENTRY_REPOSITORY';
