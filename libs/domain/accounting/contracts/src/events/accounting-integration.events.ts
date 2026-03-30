import {
  InvoiceStampedV1EventDto as SharedInvoiceStampedV1EventDto,
  PayrollStampedV1EventDto as SharedPayrollStampedV1EventDto,
  ACCOUNTING_INTEGRATION_EVENTS as SharedACCOUNTING_INTEGRATION_EVENTS
} from '@virteex/shared-contracts';

/**
 * Integration Events for Accounting Module (V1)
 * These are the canonical contracts for external domains (Billing, Payroll)
 * to integrate with Accounting.
 */

export type InvoiceStampedV1EventDto = SharedInvoiceStampedV1EventDto;
export type PayrollStampedV1EventDto = SharedPayrollStampedV1EventDto;

/**
 * @deprecated Use InvoiceStampedV1EventDto
 */
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

/**
 * @deprecated Use InvoiceStampedV1EventDto
 */
export interface InvoiceStampedEventDto {
  invoiceId: string;
  tenantId: string;
  stampDate: string;
  taxAuthId: string;
}

/**
 * @deprecated Use PayrollStampedV1EventDto
 */
export interface PayrollStampedEventDto {
  payrollId: string;
  tenantId: string;
  totalAmount: number;
  date: string;
}

export const ACCOUNTING_INTEGRATION_EVENTS = SharedACCOUNTING_INTEGRATION_EVENTS;

/**
 * @deprecated Use ACCOUNTING_INTEGRATION_EVENTS
 */
export const ACCOUNTING_EVENTS = ACCOUNTING_INTEGRATION_EVENTS.LEGACY;
