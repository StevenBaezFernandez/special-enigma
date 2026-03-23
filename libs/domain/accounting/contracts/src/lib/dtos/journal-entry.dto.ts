import { JournalEntryStatus } from '../enums/journal-entry-status.enum';
import { JournalEntryType } from '../enums/journal-entry-type.enum';

export interface JournalEntryLineDto {
  id: string;
  accountId: string;
  debit: string;
  credit: string;
  description?: string;
}

export interface JournalEntryDto {
  id: string;
  tenantId: string;
  date: Date;
  description: string;
  status: JournalEntryStatus;
  type: JournalEntryType;
  lines: JournalEntryLineDto[];
  reference?: string;
  amount?: number;
}
