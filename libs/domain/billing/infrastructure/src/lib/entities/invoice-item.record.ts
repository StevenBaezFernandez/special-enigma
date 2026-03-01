import { v4 } from 'uuid';
import { InvoiceRecord } from './invoice.record';

export class InvoiceItemRecord {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => InvoiceRecord)
  invoice!: InvoiceRecord;

    description!: string;

    quantity!: number;

    unitPrice!: string;

    amount!: string;

    taxAmount!: string;

    productId?: string;
}
