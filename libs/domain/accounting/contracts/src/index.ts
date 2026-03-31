// Core Interfaces
export * from './core/create-account.interface';
export * from './core/accounting-ops.interface';

// API Contracts (Namespaced to prevent semantic drift)
export * as ApiV1Requests from './api/v1/requests/create-account.dto';
export * as ApiV1Responses from './api/v1/responses/account.dto';
export * as ApiV2Responses from './api/v2/responses/account.v2.dto';

// Re-exporting main DTOs for backward compatibility if needed, but encouraging namespaced usage
export * from './api/v1/requests/create-account.dto';
export * from './api/v1/requests/record-journal-entry.dto';
export * from './api/v1/requests/accounting-ops.dto';
export * from './api/v1/responses/account.dto';
export * from './api/v2/responses/account.v2.dto';
export * from './api/v1/responses/journal-entry.dto';
export * from './api/v2/responses/journal-entry.v2.dto';
export * from './api/v1/responses/financial-report.dto';

// Errors & Events
export * from './errors/integration.error';
export * from './events/accounting-integration.events';
export * from './events/v1/account-created.event';

// Shared Models
export * as SharedModels from './shared/account.model';
export * from './shared/account.model';
export * from './shared/flattened-account.model';
export * from './shared/general-ledger.model';
export * from './shared/journal.model';
export * from './shared/ledger.model';
export * from './shared/journal-entry.model';

// Enums
export * from './shared/enums/account-type.enum';
export * from './shared/enums/journal-entry-status.enum';
export * from './shared/enums/journal-entry-type.enum';
export * from './shared/enums/financial-report-type.enum';

// Compatibility & Integration
export * from './compatibility/v1-to-v2.mapper';
export * from './integration/reporting.port';
