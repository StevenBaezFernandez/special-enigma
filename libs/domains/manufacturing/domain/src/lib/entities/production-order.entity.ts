import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class ProductionOrder {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  productSku!: string;

  @Property()
  warehouseId!: string;

  @Property()
  quantity!: number;

  @Property()
  status!: string;

  @Property()
  dueDate!: Date;

  constructor(tenantId: string, warehouseId: string, productSku: string, quantity: number, dueDate: Date) {
    this.tenantId = tenantId;
    this.warehouseId = warehouseId;
    this.productSku = productSku;
    this.quantity = quantity;
    this.dueDate = dueDate;
    this.status = 'PLANNED';
  }
}
