import { Entity, PrimaryKey, Property, OneToMany, Collection, Cascade } from '@mikro-orm/core';

@Entity()
export class BillOfMaterials {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  productSku!: string; // Changed from productId to productSku to align with ProductionOrder

  @Property()
  version!: string;

  @Property({ default: true })
  isActive = true;

  @OneToMany('BillOfMaterialsComponent', 'billOfMaterials', { cascade: [Cascade.ALL] })
  components = new Collection<BillOfMaterialsComponent>(this);

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(tenantId: string, productSku: string, version: string) {
    this.tenantId = tenantId;
    this.productSku = productSku;
    this.version = version;
  }
}

@Entity()
export class BillOfMaterialsComponent {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  componentProductSku!: string; // Changed from componentProductId

  @Property({ type: 'decimal', precision: 10, scale: 4 })
  quantity!: number;

  @Property()
  unit!: string;

  @Property()
  billOfMaterials!: BillOfMaterials;

  constructor(tenantId: string, componentProductSku: string, quantity: number, unit: string) {
    this.tenantId = tenantId;
    this.componentProductSku = componentProductSku;
    this.quantity = quantity;
    this.unit = unit;
  }
}
