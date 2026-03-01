import { v4 } from 'uuid';

export class InvoiceRecord {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

    tenantId!: string;

    customerId!: string;

    issueDate!: Date;

    dueDate!: Date;

    paymentForm!: string;

    paymentMethod!: string;

    usage!: string;

    totalAmount!: string;

    taxAmount!: string;

    subTotal?: string;

    notes?: string;

    status!: string;

    fiscalUuid?: string;

    xmlContent?: string;

    stampedAt?: Date;

  @OneToMany('InvoiceItemRecord', 'invoice', { cascade: [Cascade.ALL], orphanRemoval: true })
  items = new Collection<any>(this);
}
