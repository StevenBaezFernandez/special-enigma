import { EntitySchema, Cascade } from '@mikro-orm/core';
import { PosSale, PosSaleItem, PosShift, ShiftStatus, PosSaleStatus } from '@virteex/domain-pos-domain';

export const PosSaleSchema = new EntitySchema<PosSale>({
  class: PosSale,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    terminalId: { type: 'string' },
    total: { type: 'string' },
    status: { enum: true, items: () => PosSaleStatus, default: PosSaleStatus.OPEN },
    items: { kind: '1:m', entity: 'PosSaleItem', mappedBy: 'sale', cascade: [Cascade.ALL] },
    createdAt: { type: 'Date', onCreate: () => new Date() },
  },
});

export const PosSaleItemSchema = new EntitySchema<PosSaleItem>({
  class: PosSaleItem,
  properties: {
    id: { primary: true, type: 'uuid' },
    productId: { type: 'string' },
    productName: { type: 'string' },
    price: { type: 'string' },
    quantity: { type: 'number' },
    sale: { kind: 'm:1', entity: 'PosSale', inversedBy: 'items' },
  },
});

export const PosShiftSchema = new EntitySchema<PosShift>({
  class: PosShift,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    terminalId: { type: 'string' },
    userId: { type: 'string' },
    openingBalance: { type: 'string' },
    closingBalance: { type: 'string', nullable: true },
    status: { enum: true, items: () => ShiftStatus, default: ShiftStatus.OPEN },
    openedAt: { type: 'Date', onCreate: () => new Date() },
    closedAt: { type: 'Date', nullable: true },
  },
});
