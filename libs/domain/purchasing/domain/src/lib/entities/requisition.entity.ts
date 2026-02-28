import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class Requisition {
  @PrimaryKey()
  id: string = v4();

  @Property()
  tenantId!: string;

  @Property()
  reqNumber!: string;

  @Property()
  requester!: string;

  @Property()
  department!: string;

  @Property()
  date!: Date;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  total!: string;

  @Property()
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' = 'Draft';

  @Property({ type: 'json' })
  items!: any[]; // Using json for simplicity as per quick implementation, ideally separate entity

  constructor(tenantId: string, reqNumber: string, requester: string, department: string, date: Date, items: any[]) {
    this.tenantId = tenantId;
    this.reqNumber = reqNumber;
    this.requester = requester;
    this.department = department;
    this.date = date;
    this.items = items;
    this.total = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0).toFixed(2);
  }
}
