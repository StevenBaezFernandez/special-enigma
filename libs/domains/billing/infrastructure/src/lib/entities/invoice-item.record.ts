import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { InvoiceRecord } from './invoice.record';

@Entity({ tableName: 'billing_invoice_items' })
export class InvoiceItemRecord {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => InvoiceRecord)
  invoice!: InvoiceRecord;

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
}
