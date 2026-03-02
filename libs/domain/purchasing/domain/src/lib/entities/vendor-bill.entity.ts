import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import { v4 } from 'uuid';

export class VendorBill {
    id: string = v4();

  @Property()
    tenantId!: string;

    supplierId!: string;

    billNumber!: string;

  @Property()
    issueDate!: Date;

  @Property()
    dueDate!: Date;

  @Property()
    notes?: string;

    lineItems!: any[];

  @Property()
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
