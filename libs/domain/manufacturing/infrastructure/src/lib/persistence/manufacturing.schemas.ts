import { EntitySchema, Cascade } from '@mikro-orm/core';
import { ProductionOrder, ProductionOrderComponent, BillOfMaterials, BillOfMaterialsComponent } from '@virteex/domain-manufacturing-domain';

export const ProductionOrderSchema = new EntitySchema<ProductionOrder>({
  class: ProductionOrder,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    orderNumber: { type: 'string' },
    productSku: { type: 'string' },
    warehouseId: { type: 'string' },
    quantity: { type: 'number' },
    status: { type: 'string' },
    dueDate: { type: 'Date' },
    components: { kind: '1:m', entity: 'ProductionOrderComponent', mappedBy: 'productionOrder', cascade: [Cascade.ALL] },
  },
});

export const ProductionOrderComponentSchema = new EntitySchema<ProductionOrderComponent>({
  class: ProductionOrderComponent,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    productionOrder: { kind: 'm:1', entity: 'ProductionOrder' },
    componentProductSku: { type: 'string' },
    requiredQuantity: { type: 'number' },
    reservedQuantity: { type: 'number' },
    consumedQuantity: { type: 'number' },
  },
});

export const BillOfMaterialsSchema = new EntitySchema<BillOfMaterials>({
  class: BillOfMaterials,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    productSku: { type: 'string' },
    version: { type: 'string' },
    isActive: { type: 'boolean' },
    components: { kind: '1:m', entity: 'BillOfMaterialsComponent', mappedBy: 'billOfMaterials', cascade: [Cascade.ALL] },
    createdAt: { type: 'Date' },
    updatedAt: { type: 'Date' },
  },
});

export const BillOfMaterialsComponentSchema = new EntitySchema<BillOfMaterialsComponent>({
  class: BillOfMaterialsComponent,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    billOfMaterials: { kind: 'm:1', entity: 'BillOfMaterials' },
    componentProductSku: { type: 'string' },
    quantity: { type: 'number' },
    unit: { type: 'string' },
  },
});
