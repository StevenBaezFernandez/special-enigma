export { Account } from './entities/account.entity';
export { AccountingPolicy } from './entities/accounting-policy.entity';
export { JournalEntry } from './entities/journal-entry.entity';
export { JournalEntryLine } from './entities/journal-entry-line.entity';
export { FiscalYear, FiscalYearStatus } from './entities/fiscal-year.entity';

export { type DomainEvent } from './events/domain-event.interface';
export { AccountCreated } from './events/account-created.event';

export { AccountType } from './value-objects/account-type.enum';
export { JournalEntryStatus } from './value-objects/journal-entry-status.enum';
export { JournalEntryType } from './value-objects/journal-entry-type.enum';
export { Money } from './value-objects/money.vo';

export * from './errors/accounting.errors';

export { type AccountRepository, ACCOUNT_REPOSITORY } from './repository-ports/account.repository';
export { type PolicyRepository, POLICY_REPOSITORY } from './repository-ports/policy.repository';
export { type JournalEntryRepository, JOURNAL_ENTRY_REPOSITORY } from './repository-ports/journal-entry.repository';

export interface OutboxMessage {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  payload: unknown;
  createdAt: Date;
  processedAt?: Date;
  tenantId: string;
}

export interface OutboxRepository {
  save(message: OutboxMessage): Promise<void>;
  findUnprocessed(limit: number): Promise<OutboxMessage[]>;
  markAsProcessed(id: string): Promise<void>;
}

export const OUTBOX_REPOSITORY = 'OUTBOX_REPOSITORY';

export type { CurrencyRevaluationService } from './domain-services/currency-revaluation.service';
