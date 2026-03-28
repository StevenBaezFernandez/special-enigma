import { EntitySchema } from '@mikro-orm/core';
import { Sale, SaleItem, SaleStatus } from '@virteex/domain-crm-domain';

export const SaleSchema = new EntitySchema<Sale>({
  class: Sale,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    customerId: { type: 'string' },
    customerName: { type: 'string' },
    total: { type: 'string' },
    status: { enum: true, items: () => SaleStatus, default: SaleStatus.DRAFT },
    items: { kind: '1:m', entity: 'SaleItem', mappedBy: 'sale', cascade: ['all' as any] },
    createdAt: { type: 'Date', onCreate: () => new Date() },
  },
});

export const SaleItemSchema = new EntitySchema<SaleItem>({
  class: SaleItem,
  properties: {
    id: { primary: true, type: 'uuid' },
    productId: { type: 'string' },
    productName: { type: 'string' },
    price: { type: 'string' },
    quantity: { type: 'string' },
    sale: { kind: 'm:1', entity: 'Sale', inversedBy: 'items' },
  },
});
