import { JournalEntryStatus } from '@virteex/domain-accounting-contracts';
import type { JournalEntryLine } from './journal-entry-line.entity';

export class JournalEntry {
  id!: string;
  tenantId!: string;
  date!: Date;
  description!: string;
  status: JournalEntryStatus = JournalEntryStatus.DRAFT;
  lines: JournalEntryLine[] = [];

  constructor(tenantId: string, description: string, date: Date) {
    this.tenantId = tenantId;
    this.description = description;
    this.date = date;
  }

  addLine(line: JournalEntryLine) {
    this.lines.push(line);
    line.journalEntry = this;
  }
}
