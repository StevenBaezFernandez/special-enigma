import { EntitySchema, Cascade } from '@mikro-orm/core';
import { ProductionOrder, BillOfMaterials, BillOfMaterialsComponent } from '@virteex/domain-manufacturing-domain';

export const ProductionOrderSchema = new EntitySchema<ProductionOrder>({
  class: ProductionOrder,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    orderNumber: { type: 'string' },
    productId: { type: 'string' },
    quantity: { type: 'number' },
    status: { type: 'string' },
    startDate: { type: 'Date' },
    endDate: { type: 'Date', nullable: true },
  },
});

export const BillOfMaterialsSchema = new EntitySchema<BillOfMaterials>({
  class: BillOfMaterials,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    productId: { type: 'string' },
    name: { type: 'string' },
    components: { kind: '1:m', entity: 'BillOfMaterialsComponent', mappedBy: 'bom', cascade: [Cascade.ALL] },
  },
});

export const BillOfMaterialsComponentSchema = new EntitySchema<BillOfMaterialsComponent>({
  class: BillOfMaterialsComponent,
  properties: {
    id: { primary: true, type: 'uuid' },
    bom: { kind: 'm:1', entity: 'BillOfMaterials' },
    productId: { type: 'string' },
    quantity: { type: 'number' },
  },
});
