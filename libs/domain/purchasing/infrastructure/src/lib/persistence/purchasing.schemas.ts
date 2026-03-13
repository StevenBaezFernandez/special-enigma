import { EntitySchema, Cascade } from '@mikro-orm/core';
import { Supplier, PurchaseOrder, PurchaseOrderItem, Requisition, VendorBill } from '@virteex/domain-purchasing-domain';

export const SupplierSchema = new EntitySchema<Supplier>({
  class: Supplier,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    name: { type: 'string' },
    taxId: { type: 'string' },
    type: { type: 'string' },
    email: { type: 'string', nullable: true },
    phoneNumber: { type: 'string', nullable: true },
    address: { type: 'string', nullable: true },
    createdAt: { type: 'Date' },
  },
});

export const PurchaseOrderSchema = new EntitySchema<PurchaseOrder>({
  class: PurchaseOrder,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    orderNumber: { type: 'string' },
    supplierId: { type: 'string' },
    status: { type: 'string' },
    totalAmount: { type: 'string' },
    expectedDate: { type: 'Date' },
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
    reqNumber: { type: 'string' },
    status: { type: 'string' },
    requester: { type: 'string' },
    department: { type: 'string' },
    date: { type: 'Date' },
    total: { type: 'string' },
    items: { type: 'json' },
  },
});

export const VendorBillSchema = new EntitySchema<VendorBill>({
  class: VendorBill,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    supplierId: { type: 'string' },
    billNumber: { type: 'string' },
    issueDate: { type: 'Date' },
    dueDate: { type: 'Date' },
    notes: { type: 'string', nullable: true },
    lineItems: { type: 'json' },
    totalAmount: { type: 'string' },
    status: { type: 'string' },
  },
});
