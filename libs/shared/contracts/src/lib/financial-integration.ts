/**
 * Cross-domain integration events for Financial processes.
 */

export interface InvoiceStampedV1EventDto {
  invoiceId: string;
  tenantId: string;
  totalAmount: number;
  taxAmount: number;
  stampedAt: string; // ISO Date
}

export interface PayrollStampedV1EventDto {
  payrollId: string;
  tenantId: string;
  netAmount: number;
  taxAmount: number;
  stampedAt: string; // ISO Date
}

export const ACCOUNTING_INTEGRATION_EVENTS = {
  INVOICE_STAMPED_V1: 'integration.v1.billing.invoice.stamped',
  PAYROLL_STAMPED_V1: 'integration.v1.payroll.payroll.stamped',

  // Legacy events for backward compatibility during transition
  LEGACY: {
    BILLING_INVOICE_VALIDATED: 'billing.invoice.validated',
    INVOICE_STAMPED: 'invoice.stamped',
    PAYROLL_STAMPED: 'payroll.stamped',
  }
} as const;
