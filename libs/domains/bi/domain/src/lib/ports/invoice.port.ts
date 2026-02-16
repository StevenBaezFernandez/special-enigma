export interface InvoiceStatusSummary {
  paid: number;
  pending: number;
  overdue: number;
}

export interface ArAging {
  current: number;
  days30: number;
  days60: number;
  days90: number;
  over90: number;
}

export interface InvoicePort {
  getStatusSummary(tenantId: string): Promise<InvoiceStatusSummary>;
  getArAging(tenantId: string): Promise<ArAging>;
}

export const INVOICE_PORT = 'BI_INVOICE_PORT';
