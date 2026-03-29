export interface IAccountingReportingPort {
  countJournalEntries(tenantId: string): Promise<number>;
}

export const ACCOUNTING_REPORTING_PORT = 'ACCOUNTING_REPORTING_PORT';
