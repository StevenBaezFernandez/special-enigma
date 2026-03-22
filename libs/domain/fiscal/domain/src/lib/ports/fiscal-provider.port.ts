import { FiscalInvoiceData } from '../entities/fiscal-invoice.entity';

export interface FiscalProvider {
  validateInvoice(invoice: FiscalInvoiceData): Promise<boolean>;
  signInvoice(invoice: FiscalInvoiceData): Promise<string>;
  transmitInvoice(invoice: FiscalInvoiceData): Promise<void>;
}
