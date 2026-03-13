import { Entity, PrimaryKey, Property, Collection, ManyToOne } from '@mikro-orm/core';

@Entity()
export class PurchaseOrderItem {
  @PrimaryKey()
  id: string = v4();

  @Property()
  productId!: string;

  @Property()
  quantity!: number;

  @Property()
  unitPrice!: string;

  @ManyToOne('PurchaseOrder')
  purchaseOrder!: any;

  constructor(productId: string, quantity: number, unitPrice: string) {
    this.productId = productId;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
  }
}

import { v4 } from 'uuid';

@Entity()
export class PurchaseOrder {
  @PrimaryKey()
  id: string = v4();

  @Property()
  tenantId!: string;

  @Property()
  orderNumber!: string;

  @Property()
  supplierId!: string;

  @Property()
  status!: string;

  @Property()
  totalAmount!: string;

  @Property()
  expectedDate!: Date;

  @Property({ type: 'Collection' })
  items = new Collection<PurchaseOrderItem>(this);

  constructor(tenantId: string, supplierId: string, expectedDate: Date) {
    this.tenantId = tenantId;
    this.supplierId = supplierId;
    this.expectedDate = expectedDate;
    this.status = 'DRAFT';
    this.totalAmount = '0.00';
    this.orderNumber = `ORD-${this.id.substring(0, 8).toUpperCase()}`;
  }

  addItem(item: PurchaseOrderItem) {
    this.items.add(item);
  }
}
