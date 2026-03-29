export * from './entities/account.entity';
export * from './entities/accounting-policy.entity';
export * from './entities/journal-entry.entity';
export * from './entities/journal-entry-line.entity';
export * from './entities/fiscal-year.entity';

export * from './events/domain-event.interface';
export * from './events/account-created.event';

export * from './value-objects/account-type.enum';
export * from './value-objects/journal-entry-status.enum';
export * from './value-objects/journal-entry-type.enum';
export * from './value-objects/money.vo';

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
export const TELEMETRY_SERVICE = 'TELEMETRY_SERVICE';

export interface ITelemetryService {
  recordSecurityEvent(eventName: string, details: Record<string, unknown>): void;
  recordBusinessMetric(name: string, value: number, attributes?: Record<string, string | number | boolean>): void;
  setTraceAttributes(attributes: Record<string, string | number | boolean>): void;
}

export type { CurrencyRevaluationService } from './domain-services/currency-revaluation.service';
