export const BI_ACCOUNTING_PORT = 'BI_ACCOUNTING_PORT';

export interface BiAccountingPort {
  getMonthlyOpex(tenantId: string): Promise<number>;
}
