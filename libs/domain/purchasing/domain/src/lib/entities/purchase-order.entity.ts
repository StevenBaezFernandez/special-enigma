
import { PurchaseOrderStatus } from '../enums/purchase-order-status.enum';
import { Supplier } from './supplier.entity';
import type { PurchaseOrderItem } from './purchase-order-item.entity';


export class PurchaseOrder {

  id!: string;


    tenantId!: string;


  supplier!: Supplier;

    expectedDate!: Date;



  status: PurchaseOrderStatus = PurchaseOrderStatus.DRAFT;


  items = new Collection<PurchaseOrderItem>(this);

    get totalAmount(): number {
    return this.items.getItems().reduce((sum, item) => sum + item.total, 0);
  }


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
