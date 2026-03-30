export interface InvoiceValidatedEventDto {
  invoiceId: string;
  tenantId: string;
  totalAmount: number;
  currency: string;
  date: string;
  customerId: string;
  lines: Array<{
    description: string;
    amount: number;
    taxAmount: number;
    accountCode?: string;
  }>;
}

export interface InvoiceStampedEventDto {
  invoiceId: string;
  tenantId: string;
  stampDate: string;
  taxAuthId: string;
}

export interface PayrollStampedEventDto {
  payrollId: string;
  tenantId: string;
  totalAmount: number;
  date: string;
}

export const ACCOUNTING_EVENTS = {
  BILLING_INVOICE_VALIDATED: 'billing.invoice.validated',
  INVOICE_STAMPED: 'invoice.stamped',
  PAYROLL_STAMPED: 'payroll.stamped',
} as const;
