import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Warehouse } from './warehouse.entity';
import { Location } from './location.entity';

export enum InventoryMovementType {
  IN = 'IN',
  OUT = 'OUT',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT'
}

@Entity()
export class InventoryMovement {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  tenantId!: string;

  @Property()
  productId!: string; // Reference to Catalog Product ID

  @ManyToOne(() => Warehouse)
  warehouse!: Warehouse;

  @ManyToOne(() => Location, { nullable: true })
  location?: Location;

  @Enum(() => InventoryMovementType)
  type!: InventoryMovementType;

  @Property({ type: 'decimal', precision: 14, scale: 4 })
  quantity!: string;

  @Property()
  reference!: string; // e.g., PO-123, INV-456

  @Property()
  date: Date = new Date();

  @Property()
  createdAt: Date = new Date();

  @Property({ nullable: true })
  lotId?: string;

  @Property({ nullable: true })
  serialNumber?: string;

  constructor(
    tenantId: string,
    productId: string,
    warehouse: Warehouse,
    type: InventoryMovementType,
    quantity: string,
    reference: string,
    location?: Location,
    lotId?: string,
    serialNumber?: string
  ) {
    this.tenantId = tenantId;
    this.productId = productId;
    this.warehouse = warehouse;
    this.type = type;
    this.quantity = quantity;
    this.reference = reference;
    if (location) {
      this.location = location;
    }
    this.lotId = lotId;
    this.serialNumber = serialNumber;
  }
}
