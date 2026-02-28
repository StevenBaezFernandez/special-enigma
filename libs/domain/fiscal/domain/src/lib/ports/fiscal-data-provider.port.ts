export interface FiscalStats {
  taxesPayable: number;
  pendingDeclarations: number;
  nextDueDate: Date;
  status: 'OK' | 'WARNING' | 'CRITICAL';
}

export interface FiscalDataProvider {
  getFiscalStats(tenantId: string): Promise<FiscalStats>;
}

export const FISCAL_DATA_PROVIDER = 'FISCAL_DATA_PROVIDER';
