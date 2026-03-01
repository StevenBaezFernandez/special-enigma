import { v4 } from 'uuid';

export class ProductionOrder {
  id: string = v4();
  tenantId!: string;
  productSku!: string;
  warehouseId!: string;
  quantity!: number;
  status!: string;
  dueDate!: Date;
  components: ProductionOrderComponent[] = [];

  constructor(tenantId: string, warehouseId: string, productSku: string, quantity: number, dueDate: Date) {
    this.tenantId = tenantId;
    this.warehouseId = warehouseId;
    this.productSku = productSku;
    this.quantity = quantity;
    this.dueDate = dueDate;
    this.status = 'PLANNED';
  }
}

export class ProductionOrderComponent {
  id: string = v4();
  tenantId!: string;
  productionOrder!: ProductionOrder;
  componentProductSku!: string;
  requiredQuantity!: number;
  reservedQuantity = 0;
  consumedQuantity = 0;

  constructor(productionOrder: ProductionOrder, componentProductSku: string, requiredQuantity: number) {
    this.productionOrder = productionOrder;
    this.tenantId = productionOrder.tenantId;
    this.componentProductSku = componentProductSku;
    this.requiredQuantity = requiredQuantity;
  }
}
