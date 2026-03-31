export { Account } from './entities/account.entity';
export { AccountingPolicy } from './entities/accounting-policy.entity';
export { JournalEntry } from './entities/journal-entry.entity';
export { JournalEntryLine } from './entities/journal-entry-line.entity';
export { FiscalYear, FiscalYearStatus } from './entities/fiscal-year.entity';
export { FiscalPeriod, FiscalPeriodStatus } from './entities/fiscal-period.entity';
export { ClosingTask, ClosingTaskStatus } from './entities/closing-task.entity';
export { Invoice, InvoiceStatus } from './entities/invoice.entity';
export { Payment } from './entities/payment.entity';

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
export { type FiscalPeriodRepository, FISCAL_PERIOD_REPOSITORY } from './repository-ports/fiscal-period.repository';
export { type ClosingTaskRepository, CLOSING_TASK_REPOSITORY } from './repository-ports/closing-task.repository';
export { type AccountsPayableRepository, ACCOUNTS_PAYABLE_REPOSITORY } from './repository-ports/accounts-payable.repository';
export { type AccountsReceivableRepository, ACCOUNTS_RECEIVABLE_REPOSITORY } from './repository-ports/accounts-receivable.repository';
export { type BankReconciliationRepository, BANK_RECONCILIATION_REPOSITORY } from './repository-ports/bank-reconciliation.repository';

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

export { CurrencyRevaluationService } from './domain-services/currency-revaluation.service';
