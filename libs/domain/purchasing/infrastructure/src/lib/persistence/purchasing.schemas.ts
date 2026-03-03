import { EntitySchema, Cascade } from '@mikro-orm/core';
import { Supplier, PurchaseOrder, PurchaseOrderItem, Requisition, VendorBill } from '@virteex/domain-purchasing-domain';

export const SupplierSchema = new EntitySchema<Supplier>({
  class: Supplier,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string', nullable: true },
    taxId: { type: 'string', nullable: true },
  },
});

export const PurchaseOrderSchema = new EntitySchema<PurchaseOrder>({
  class: PurchaseOrder,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    orderNumber: { type: 'string' },
    supplier: { kind: 'm:1', entity: 'Supplier' },
    status: { type: 'string' },
    totalAmount: { type: 'string' },
    items: { kind: '1:m', entity: 'PurchaseOrderItem', mappedBy: 'purchaseOrder', cascade: [Cascade.ALL] },
  },
});

export const PurchaseOrderItemSchema = new EntitySchema<PurchaseOrderItem>({
  class: PurchaseOrderItem,
  properties: {
    id: { primary: true, type: 'uuid' },
    purchaseOrder: { kind: 'm:1', entity: 'PurchaseOrder' },
    productId: { type: 'string' },
    quantity: { type: 'number' },
    unitPrice: { type: 'string' },
  },
});

export const RequisitionSchema = new EntitySchema<Requisition>({
  class: Requisition,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    requisitionNumber: { type: 'string' },
    status: { type: 'string' },
    requestedBy: { type: 'string' },
  },
});

export const VendorBillSchema = new EntitySchema<VendorBill>({
  class: VendorBill,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    purchaseOrder: { kind: 'm:1', entity: 'PurchaseOrder', nullable: true },
    billNumber: { type: 'string' },
    amount: { type: 'string' },
    status: { type: 'string' },
    dueDate: { type: 'Date' },
  },
});
