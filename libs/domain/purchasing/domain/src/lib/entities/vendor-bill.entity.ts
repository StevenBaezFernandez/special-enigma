import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class VendorBill {
  @PrimaryKey()
  id: string = v4();

  @Property()
  tenantId!: string;

  @Property()
  supplierId!: string;

  @Property()
  billNumber!: string;

  @Property()
  issueDate!: Date;

  @Property()
  dueDate!: Date;

  @Property({ nullable: true })
  notes?: string;

  @Property({ type: 'json' })
  lineItems!: any[];

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: string;

  @Property()
  status: 'DRAFT' | 'POSTED' | 'PAID' = 'DRAFT';

  constructor(tenantId: string, supplierId: string, billNumber: string, issueDate: Date, dueDate: Date, lineItems: any[]) {
    this.tenantId = tenantId;
    this.supplierId = supplierId;
    this.billNumber = billNumber;
    this.issueDate = issueDate;
    this.dueDate = dueDate;
    this.lineItems = lineItems;
    this.totalAmount = lineItems.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0).toFixed(2);
  }
}
