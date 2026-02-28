import { Entity, PrimaryKey, Property, OneToMany, Collection, Cascade } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { InvoiceItemRecord } from './invoice-item.record';

@Entity({ tableName: 'billing_invoices' })
export class InvoiceRecord {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  tenantId!: string;

  @Property()
  customerId!: string;

  @Property()
  issueDate!: Date;

  @Property()
  dueDate!: Date;

  @Property()
  paymentForm!: string;

  @Property()
  paymentMethod!: string;

  @Property()
  usage!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  taxAmount!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  subTotal?: string;

  @Property({ nullable: true })
  notes?: string;

  @Property()
  status!: string;

  @Property({ nullable: true })
  fiscalUuid?: string;

  @Property({ nullable: true, type: 'text' })
  xmlContent?: string;

  @Property({ nullable: true })
  stampedAt?: Date;

  @OneToMany(() => InvoiceItemRecord, (item) => item.invoice, { cascade: [Cascade.ALL], orphanRemoval: true })
  items = new Collection<InvoiceItemRecord>(this);
}
