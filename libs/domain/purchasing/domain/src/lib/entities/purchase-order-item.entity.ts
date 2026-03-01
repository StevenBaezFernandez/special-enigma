import type { PurchaseOrder } from './purchase-order.entity';

export class PurchaseOrderItem {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @ManyToOne('PurchaseOrder')
  purchaseOrder!: PurchaseOrder;

    productId!: string; // Reference to Catalog Product ID

    quantity!: number;

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
