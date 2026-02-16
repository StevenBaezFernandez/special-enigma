import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Invoice } from './invoice.entity';

@Entity()
export class InvoiceItem {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => Invoice)
  invoice!: Invoice;

  @Property()
  description!: string;

  @Property()
  quantity!: number;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  amount!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  taxAmount!: string;

  @Property({ nullable: true })
  productId?: string;

  constructor(invoice: Invoice, description: string, quantity: number, unitPrice: string, amount: string, taxAmount: string) {
    this.invoice = invoice;
    this.description = description;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
    this.amount = amount;
    this.taxAmount = taxAmount;
  }
}
