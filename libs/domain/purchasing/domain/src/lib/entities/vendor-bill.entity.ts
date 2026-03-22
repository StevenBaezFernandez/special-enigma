
import { v4 } from 'uuid';
import { Decimal } from 'decimal.js';

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
    this.recalculateTotals();
  }

  recalculateTotals(): void {
    const total = this.lineItems.reduce(
      (sum: Decimal, item: VendorBillLineItem) => sum.plus(new Decimal(item.quantity).times(new Decimal(item.price))),
      new Decimal(0)
    );
    this.totalAmount = total.toFixed(2);
  }
}

export interface VendorBillLineItem {
  description: string;
  quantity: number;
  price: number | string;
  taxAmount?: number | string;
  productId?: string;
}
