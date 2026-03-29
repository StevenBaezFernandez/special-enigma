export * from './accounting-application.module';

// Use cases: needed by presentation layer for DI.
// These should generally be accessed via Controllers or Resolvers.
export * from './use-cases/accounts/create-account.use-case';
export * from './use-cases/journal-entries/record-journal-entry.use-case';
export * from './use-cases/accounts/get-accounts.use-case';
export * from './use-cases/journal-entries/get-journal-entries.use-case';
export * from './use-cases/accounts/setup-chart-of-accounts.use-case';
export * from './use-cases/reports/generate-financial-report.use-case';
export * from './use-cases/fiscal-periods/close-fiscal-period.use-case';

// Services for inter-domain or specialized integration
export * from './services/accounting-policy.service';
export * from './services/accounting-event-handler.service';

// Outbound ports for infrastructure implementation or cross-domain consumption
export * from './ports/outbound/message-broker.port';
export * from './ports/outbound/unit-of-work.port';
