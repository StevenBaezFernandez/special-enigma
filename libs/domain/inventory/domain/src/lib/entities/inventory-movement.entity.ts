import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import { v4 } from 'uuid';

export enum InventoryMovementType {
  IN = 'IN',
  OUT = 'OUT',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT'
}

export class InventoryMovement {
  id: string;
  @Property()
  tenantId: string;
  @Property()
  productId: string;
  warehouseId: string;
  locationId?: string;
  type: InventoryMovementType;
  @Property()
  quantity: string;
  reference: string;
  date: Date;
  @Property()
  createdAt: Date;
  lotId?: string;
  serialNumber?: string;

  constructor(
  @Property()
    tenantId: string,
  @Property()
    productId: string,
    warehouseId: string,
    type: InventoryMovementType,
  @Property()
    quantity: string,
    reference: string,
    locationId?: string,
    lotId?: string,
    serialNumber?: string,
    id?: string
  ) {
    this.id = id || v4();
    this.tenantId = tenantId;
    this.productId = productId;
    this.warehouseId = warehouseId;
    this.type = type;
    this.quantity = quantity;
    this.reference = reference;
    this.locationId = locationId;
    this.lotId = lotId;
    this.serialNumber = serialNumber;
    this.date = new Date();
    this.createdAt = new Date();
  }
}
