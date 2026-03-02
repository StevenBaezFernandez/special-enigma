import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import { v4 } from 'uuid';

export class ProductionOrder {
  id: string = v4();
  @Property()
  tenantId!: string;
  productSku!: string;
  warehouseId!: string;
  @Property()
  quantity!: number;
  @Property()
  status!: string;
  @Property()
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
  @Property()
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
