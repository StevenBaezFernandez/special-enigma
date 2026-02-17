import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import type { PurchaseOrder } from './purchase-order.entity';

@Entity()
export class PurchaseOrderItem {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @ManyToOne('PurchaseOrder')
  purchaseOrder!: PurchaseOrder;

  @Property()
  productId!: string; // Reference to Catalog Product ID

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  quantity!: number;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: number;

  @Property({ persist: false })
  get total(): number {
    return Number(this.quantity) * Number(this.unitPrice);
  }

  constructor(productId: string, quantity: number, unitPrice: number) {
    this.productId = productId;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
  }
}
