import { v4 } from 'uuid';

export enum InventoryMovementType {
  IN = 'IN',
  OUT = 'OUT',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT'
}

export class InventoryMovement {
  id: string;
  tenantId: string;
  productId: string;
  warehouseId: string;
  locationId?: string;
  type: InventoryMovementType;
  quantity: string;
  reference: string;
  date: Date;
  createdAt: Date;
  lotId?: string;
  serialNumber?: string;

  constructor(
    tenantId: string,
    productId: string,
    warehouseId: string,
    type: InventoryMovementType,
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
