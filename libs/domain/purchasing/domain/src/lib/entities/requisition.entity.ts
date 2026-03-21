
import { v4 } from 'uuid';

export class Requisition {
    id: string = v4();


    tenantId!: string;

    reqNumber!: string;

    requester!: string;

    department!: string;

    date!: Date;

    total!: string;


    status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' = 'Draft';

    items!: RequisitionItem[];

  constructor(tenantId: string, reqNumber: string, requester: string, department: string, date: Date, items: RequisitionItem[]) {
    this.tenantId = tenantId;
    this.reqNumber = reqNumber;
    this.requester = requester;
    this.department = department;
    this.date = date;
    this.items = items;
    this.total = items.reduce((sum: number, item: RequisitionItem) => sum + (item.quantity * item.unitPrice), 0).toFixed(2);
  }
}

export interface RequisitionItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}
