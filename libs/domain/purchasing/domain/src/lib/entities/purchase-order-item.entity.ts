import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import type { PurchaseOrder } from './purchase-order.entity';

@Entity()
export class PurchaseOrderItem {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @ManyToOne('PurchaseOrder')
  purchaseOrder!: PurchaseOrder;

  @Property()
    productId!: string; // Reference to Catalog Product ID

  @Property()
    quantity!: number;

  @Property()
    unitPrice!: number;

    get total(): number {
    return Number(this.quantity) * Number(this.unitPrice);
  }

  constructor(productId: string, quantity: number, unitPrice: number) {
    this.productId = productId;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
  }
}
