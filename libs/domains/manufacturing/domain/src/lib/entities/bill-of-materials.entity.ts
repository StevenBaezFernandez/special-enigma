import { Entity, PrimaryKey, Property, OneToMany, Collection, Cascade } from '@mikro-orm/core';

@Entity()
export class BillOfMaterials {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  productId!: string; // Reference to Inventory Product

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

  constructor(tenantId: string, productId: string, version: string) {
    this.tenantId = tenantId;
    this.productId = productId;
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
  componentProductId!: string; // Reference to Inventory Product (Material)

  @Property({ type: 'decimal', precision: 10, scale: 4 })
  quantity!: number;

  @Property()
  unit!: string;

  @Property()
  billOfMaterials!: BillOfMaterials;

  constructor(tenantId: string, componentProductId: string, quantity: number, unit: string) {
    this.tenantId = tenantId;
    this.componentProductId = componentProductId;
    this.quantity = quantity;
    this.unit = unit;
  }
}
