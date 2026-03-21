
import { v4 } from 'uuid';

export class VendorBill {
    id: string = v4();


    tenantId!: string;

    supplierId!: string;

    billNumber!: string;


    issueDate!: Date;


    dueDate!: Date;


    notes?: string;

    lineItems!: VendorBillLineItem[];


    totalAmount!: string;


    status: 'DRAFT' | 'POSTED' | 'PAID' = 'DRAFT';

  constructor(tenantId: string, supplierId: string, billNumber: string, issueDate: Date, dueDate: Date, lineItems: VendorBillLineItem[]) {
    this.tenantId = tenantId;
    this.supplierId = supplierId;
    this.billNumber = billNumber;
    this.issueDate = issueDate;
    this.dueDate = dueDate;
    this.lineItems = lineItems;
    this.totalAmount = lineItems.reduce((sum: number, item: VendorBillLineItem) => sum + (item.quantity * item.price), 0).toFixed(2);
  }
}

export interface VendorBillLineItem {
  description: string;
  quantity: number;
  price: number;
  taxAmount?: number;
}
