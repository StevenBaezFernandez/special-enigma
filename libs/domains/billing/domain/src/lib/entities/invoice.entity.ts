import { v4 } from 'uuid';
import { Decimal } from 'decimal.js';
import { InvoiceItem } from './invoice-item.entity';

export type InvoiceStatus = 'DRAFT' | 'PENDING_STAMP' | 'STAMPED' | 'PAID';

export class Invoice {
  id: string;
  tenantId: string;
  customerId: string;
  issueDate: Date;
  dueDate!: Date;
  paymentForm!: string;
  paymentMethod!: string;
  usage!: string;
  totalAmount: string;
  taxAmount: string;
  subTotal?: string;
  notes?: string;
  status: InvoiceStatus;
  fiscalUuid?: string;
  xmlContent?: string;
  stampedAt?: Date;
  items: InvoiceItem[] = [];

  constructor(tenantId: string, customerId: string, totalAmount: string, taxAmount: string, id: string = v4()) {
    this.id = id;
    this.tenantId = tenantId;
    this.customerId = customerId;
    this.issueDate = new Date();
    this.totalAmount = totalAmount;
    this.taxAmount = taxAmount;
    this.status = 'DRAFT';
  }

  addItem(item: InvoiceItem): void {
    this.items.push(item);
    this.recalculateTotals();
  }

  recalculateTotals(): void {
    const subtotal = this.items.reduce((acc, item) => acc.plus(new Decimal(item.amount)), new Decimal(0));
    const totalTax = this.items.reduce((acc, item) => acc.plus(new Decimal(item.taxAmount)), new Decimal(0));

    this.subTotal = subtotal.toFixed(2);
    this.taxAmount = totalTax.toFixed(2);
    this.totalAmount = subtotal.plus(totalTax).toFixed(2);
  }

  markPendingStamp(): void {
    this.status = 'PENDING_STAMP';
  }

  markStamped(stamp: { uuid: string; xml: string; stampedAt: Date }): void {
    this.fiscalUuid = stamp.uuid;
    this.xmlContent = stamp.xml;
    this.stampedAt = stamp.stampedAt;
    this.status = 'STAMPED';
  }
}
