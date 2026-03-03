import { EntitySchema, Cascade } from '@mikro-orm/core';
import { Stock, StockBatch, Warehouse, Location, InventoryMovement, InventoryMovementType } from '@virteex/domain-inventory-domain';

export const WarehouseSchema = new EntitySchema<Warehouse>({
  class: Warehouse,
  tableName: 'warehouse',
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    code: { type: 'string', fieldName: '_code' },
    name: { type: 'string', fieldName: '_name' },
    address: { type: 'string', fieldName: '_address', nullable: true },
    description: { type: 'string', fieldName: '_description', nullable: true },
    isActive: { type: 'boolean', fieldName: '_isActive', default: true },
    createdAt: { type: 'Date', onCreate: () => new Date() },
    updatedAt: { type: 'Date', fieldName: '_updatedAt', onCreate: () => new Date(), onUpdate: () => new Date() },
  },
  uniques: [{ properties: ['tenantId', 'code'] }],
});

export const LocationSchema = new EntitySchema<Location>({
  class: Location,
  tableName: 'location',
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    warehouseId: { type: 'string' },
    code: { type: 'string' },
    type: { type: 'string' },
    createdAt: { type: 'Date', onCreate: () => new Date() },
    updatedAt: { type: 'Date', onCreate: () => new Date(), onUpdate: () => new Date() },
  },
  uniques: [{ properties: ['warehouseId', 'code'] }],
});

export const StockSchema = new EntitySchema<Stock>({
  class: Stock,
  tableName: 'stock',
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    productId: { type: 'string' },
    warehouseId: { type: 'string' },
    locationId: { type: 'string', nullable: true },
    quantity: { type: 'decimal', precision: 14, scale: 4, default: '0' },
    batches: { kind: '1:m', entity: 'StockBatch', mappedBy: 'stockId', cascade: [Cascade.ALL] },
    createdAt: { type: 'Date', onCreate: () => new Date() },
    updatedAt: { type: 'Date', onCreate: () => new Date(), onUpdate: () => new Date() },
  },
  uniques: [{ properties: ['warehouseId', 'locationId', 'productId'] }],
});

export const StockBatchSchema = new EntitySchema<StockBatch>({
  class: StockBatch,
  tableName: 'stock_batch',
  properties: {
    id: { primary: true, type: 'uuid' },
    stockId: { type: 'string' },
    quantity: { type: 'decimal', precision: 14, scale: 4, default: '0' },
    entryDate: { type: 'Date' },
    expirationDate: { type: 'Date', nullable: true },
    cost: { type: 'decimal', precision: 14, scale: 4, nullable: true },
  },
});

export const InventoryMovementSchema = new EntitySchema<InventoryMovement>({
  class: InventoryMovement,
  tableName: 'inventory_movement',
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    productId: { type: 'string' },
    warehouseId: { type: 'string' },
    locationId: { type: 'string', nullable: true },
    type: { enum: true, items: () => InventoryMovementType },
    quantity: { type: 'decimal', precision: 14, scale: 4 },
    reference: { type: 'string' },
    date: { type: 'Date', onCreate: () => new Date() },
    createdAt: { type: 'Date', onCreate: () => new Date() },
    lotId: { type: 'string', nullable: true },
    serialNumber: { type: 'string', nullable: true },
  },
});
