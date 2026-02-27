import { Invoice } from '@virteex/domain-billing-domain';

export const INVOICE_INTEGRATION_PUBLISHER = 'INVOICE_INTEGRATION_PUBLISHER';

export interface InvoiceIntegrationPublisherPort {
  publishInvoiceStamped(invoice: Invoice): Promise<void>;
}
