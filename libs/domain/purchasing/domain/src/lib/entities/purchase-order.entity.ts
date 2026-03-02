import { Cascade, Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import { PurchaseOrderStatus } from '../enums/purchase-order-status.enum';
import { Supplier } from './supplier.entity';
import type { PurchaseOrderItem } from './purchase-order-item.entity';

@Entity()
export class PurchaseOrder {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
    tenantId!: string;

  @ManyToOne(() => Supplier)
  supplier!: Supplier;

    expectedDate!: Date;

  @Enum(() => PurchaseOrderStatus)
  @Property()
  status: PurchaseOrderStatus = PurchaseOrderStatus.DRAFT;

  @OneToMany('PurchaseOrderItem', 'purchaseOrder', { cascade: [Cascade.ALL] })
  items = new Collection<PurchaseOrderItem>(this);

    get totalAmount(): number {
    return this.items.getItems().reduce((sum, item) => sum + item.total, 0);
  }

  @Property()
    createdAt: Date = new Date();

  constructor(tenantId: string, supplier: Supplier, expectedDate: Date) {
    this.tenantId = tenantId;
    this.supplier = supplier;
    this.expectedDate = expectedDate;
  }

  addItem(item: PurchaseOrderItem) {
    this.items.add(item);
    item.purchaseOrder = this;
  }
}
