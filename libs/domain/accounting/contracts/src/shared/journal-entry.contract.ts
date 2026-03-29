/**
 * @deprecated Use JournalEntryDto from @virteex/domain-accounting-contracts instead.
 */
export interface JournalEntry {
  id: string;
  organizationId: string;
  date: Date;
  description: string;
  totalDebit: number;
  totalCredit: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
