export interface JournalEntryLineInputDto {
  accountId: string;
  debit: string;
  credit: string;
  description?: string;
}

export interface RecordJournalEntryDto {
  tenantId: string;
  date: Date;
  description: string;
  lines: JournalEntryLineInputDto[];
}
