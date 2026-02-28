export interface FiscalProvider {
  validateInvoice(invoice: any): Promise<boolean>;
  signInvoice(invoice: any): Promise<string>;
  transmitInvoice(invoice: any): Promise<void>;
}
