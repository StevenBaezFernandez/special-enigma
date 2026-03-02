import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
export class BillOfMaterials {
  id!: string;
  @Property()
  tenantId!: string;
  productSku!: string; // Changed from productId to productSku to align with ProductionOrder
  version!: string;
  isActive = true;
  components: BillOfMaterialsComponent[] = [];
  @Property()
  createdAt: Date = new Date();
  @Property()
  updatedAt: Date = new Date();

  constructor(tenantId: string, productSku: string, version: string) {
    this.tenantId = tenantId;
    this.productSku = productSku;
    this.version = version;
  }
}

export class BillOfMaterialsComponent {
  id!: string;
  @Property()
  tenantId!: string;
  componentProductSku!: string; // Changed from componentProductId
  @Property()
  quantity!: number;
  unit!: string;
  billOfMaterials!: BillOfMaterials;

  constructor(tenantId: string, componentProductSku: string, quantity: number, unit: string) {
    this.tenantId = tenantId;
    this.componentProductSku = componentProductSku;
    this.quantity = quantity;
    this.unit = unit;
  }
}
