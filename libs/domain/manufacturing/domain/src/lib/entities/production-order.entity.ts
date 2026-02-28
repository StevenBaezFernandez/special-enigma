import { Entity, PrimaryKey, Property, OneToMany, Collection, Cascade, ManyToOne } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class ProductionOrder {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

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

  @OneToMany('ProductionOrderComponent', 'productionOrder', { cascade: [Cascade.ALL] })
  components = new Collection<ProductionOrderComponent>(this);

  constructor(tenantId: string, warehouseId: string, productSku: string, quantity: number, dueDate: Date) {
    this.tenantId = tenantId;
    this.warehouseId = warehouseId;
    this.productSku = productSku;
    this.quantity = quantity;
    this.dueDate = dueDate;
    this.status = 'PLANNED';
  }
}

@Entity()
export class ProductionOrderComponent {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  tenantId!: string;

  @ManyToOne(() => ProductionOrder)
  productionOrder!: ProductionOrder;

  @Property()
  componentProductSku!: string;

  @Property({ type: 'decimal', precision: 10, scale: 4 })
  requiredQuantity!: number;

  @Property({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  reservedQuantity = 0;

  @Property({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  consumedQuantity = 0;

  constructor(productionOrder: ProductionOrder, componentProductSku: string, requiredQuantity: number) {
    this.productionOrder = productionOrder;
    this.tenantId = productionOrder.tenantId;
    this.componentProductSku = componentProductSku;
    this.requiredQuantity = requiredQuantity;
  }
}
