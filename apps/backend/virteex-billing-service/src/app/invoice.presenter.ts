import { Invoice } from '@virteex/domain-billing-domain';
import { InvoiceObject } from './dto/invoice.object';

export const presentInvoice = (invoice: Invoice): InvoiceObject => ({
  id: invoice.id,
  tenantId: invoice.tenantId,
  customerId: invoice.customerId,
  issueDate: invoice.issueDate,
  dueDate: invoice.dueDate,
  totalAmount: Number(invoice.totalAmount),
  taxAmount: Number(invoice.taxAmount),
  status: invoice.status,
  fiscalUuid: invoice.fiscalUuid,
});
