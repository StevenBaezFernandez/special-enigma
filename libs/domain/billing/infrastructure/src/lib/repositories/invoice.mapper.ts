import { Invoice, InvoiceItem } from '@virteex/domain-billing-domain';
import { InvoiceRecord } from '../entities/invoice.record';
import { InvoiceItemRecord } from '../entities/invoice-item.record';

export class InvoiceMapper {
  static toDomain(record: InvoiceRecord): Invoice {
    const invoice = new Invoice(record.tenantId, record.customerId, record.totalAmount, record.taxAmount, record.id);
    invoice.issueDate = record.issueDate;
    invoice.dueDate = record.dueDate;
    invoice.paymentForm = record.paymentForm;
    invoice.paymentMethod = record.paymentMethod;
    invoice.usage = record.usage;
    invoice.subTotal = record.subTotal;
    invoice.notes = record.notes;
    invoice.status = record.status as Invoice['status'];
    invoice.fiscalUuid = record.fiscalUuid;
    invoice.xmlContent = record.xmlContent;
    invoice.stampedAt = record.stampedAt;

    invoice.items = record.items.getItems().map((itemRecord) => {
      const item = new InvoiceItem(
        itemRecord.description,
        itemRecord.quantity,
        itemRecord.unitPrice,
        itemRecord.amount,
        itemRecord.taxAmount
      );
      item.id = itemRecord.id;
      item.productId = itemRecord.productId;
      return item;
    });

    return invoice;
  }

  static toRecord(invoice: Invoice, existing?: InvoiceRecord): InvoiceRecord {
    const record = existing ?? new InvoiceRecord();

    record.id = invoice.id;
    record.tenantId = invoice.tenantId;
    record.customerId = invoice.customerId;
    record.issueDate = invoice.issueDate;
    record.dueDate = invoice.dueDate;
    record.paymentForm = invoice.paymentForm;
    record.paymentMethod = invoice.paymentMethod;
    record.usage = invoice.usage;
    record.totalAmount = invoice.totalAmount;
    record.taxAmount = invoice.taxAmount;
    record.subTotal = invoice.subTotal;
    record.notes = invoice.notes;
    record.status = invoice.status;
    record.fiscalUuid = invoice.fiscalUuid;
    record.xmlContent = invoice.xmlContent;
    record.stampedAt = invoice.stampedAt;

    record.items.removeAll();
    for (const item of invoice.items) {
      const itemRecord = new InvoiceItemRecord();
      itemRecord.id = item.id;
      itemRecord.description = item.description;
      itemRecord.quantity = item.quantity;
      itemRecord.unitPrice = item.unitPrice;
      itemRecord.amount = item.amount;
      itemRecord.taxAmount = item.taxAmount;
      itemRecord.productId = item.productId;
      itemRecord.invoice = record;
      record.items.add(itemRecord);
    }

    return record;
  }
}
