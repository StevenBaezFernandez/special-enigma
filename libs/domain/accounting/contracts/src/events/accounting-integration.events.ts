import {
  InvoiceStampedV1EventDto as SharedInvoiceStampedV1EventDto,
  PayrollStampedV1EventDto as SharedPayrollStampedV1EventDto,
  ACCOUNTING_INTEGRATION_EVENTS as SharedACCOUNTING_INTEGRATION_EVENTS,
} from '@virteex/shared-contracts';

/**
 * Integration Events for Accounting Module (V1)
 * These are the canonical contracts for external domains (Billing, Payroll)
 * to integrate with Accounting.
 */

export type InvoiceStampedV1EventDto = SharedInvoiceStampedV1EventDto;
export type PayrollStampedV1EventDto = SharedPayrollStampedV1EventDto;

export const ACCOUNTING_INTEGRATION_EVENTS =
  SharedACCOUNTING_INTEGRATION_EVENTS;

/**
 * @deprecated Legacy event contract maintained for backward compatibility.
 */
export interface InvoiceValidatedEventDto {
  invoiceId: string;
  tenantId: string;
  totalAmount: number;
  date: string;
  lines?: Array<{
    taxAmount: number;
  }>;
}

/**
 * @deprecated Legacy event names preserved for transition compatibility.
 */
export const ACCOUNTING_EVENTS = {
  BILLING_INVOICE_VALIDATED:
    SharedACCOUNTING_INTEGRATION_EVENTS.LEGACY.BILLING_INVOICE_VALIDATED,
  INVOICE_STAMPED: SharedACCOUNTING_INTEGRATION_EVENTS.LEGACY.INVOICE_STAMPED,
  PAYROLL_STAMPED: SharedACCOUNTING_INTEGRATION_EVENTS.LEGACY.PAYROLL_STAMPED,
} as const;
