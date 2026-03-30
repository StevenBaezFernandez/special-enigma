import { JournalEntryStatus } from '../../../shared/enums/journal-entry-status.enum';
import { JournalEntryType } from '../../../shared/enums/journal-entry-type.enum';
import { JournalEntryLineDto } from '../../v1/responses/journal-entry.dto';

export interface JournalEntryDtoV2 {
  id: string;
  tenantId: string;
  date: Date;
  description: string;
  status: JournalEntryStatus;
  type: JournalEntryType;
  lines: JournalEntryLineDto[];
  reference?: string;
  totalDebit: number;
  totalCredit: number;
}
