import { Entity, PrimaryKey, Property, OneToMany, Collection, Cascade } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { InvoiceItem } from './invoice-item.entity';

@Entity()
export class Invoice {
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
  paymentForm!: string; // FormaPago (e.g., 01, 03)

  @Property()
  paymentMethod!: string; // MetodoPago (e.g., PUE, PPD)

  @Property()
  usage!: string; // UsoCFDI (e.g., G03)

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  taxAmount!: string;

  @Property()
  status!: string;

  // Fiscal Stamping Fields
  @Property({ nullable: true })
  fiscalUuid?: string;

  @Property({ nullable: true, type: 'text' })
  xmlContent?: string;

  @Property({ nullable: true })
  stampedAt?: Date;

  @OneToMany(() => InvoiceItem, item => item.invoice, { cascade: [Cascade.ALL] })
  items = new Collection<InvoiceItem>(this);

  constructor(tenantId: string, customerId: string, totalAmount: string, taxAmount: string) {
    this.tenantId = tenantId;
    this.customerId = customerId;
    this.issueDate = new Date();
    this.totalAmount = totalAmount;
    this.taxAmount = taxAmount;
    this.status = 'DRAFT';
  }
}
