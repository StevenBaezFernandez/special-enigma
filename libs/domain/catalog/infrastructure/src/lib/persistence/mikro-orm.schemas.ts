import { EntitySchema } from '@mikro-orm/core';
import { Product, SatPaymentForm, SatPaymentMethod, SatCfdiUsage } from '@virteex/domain-catalog-domain';

export const ProductSchema = new EntitySchema<Product>({
  class: Product,
  schema: 'catalog',
  properties: {
    id: { primary: true, type: 'number' },
    tenantId: { type: 'string' },
    sku: { type: 'string' },
    name: { type: 'string' },
    price: { type: 'decimal', precision: 10, scale: 2 },
    fiscalCode: { type: 'string', nullable: true },
    taxGroup: { type: 'string', nullable: true },
    isActive: { type: 'boolean', default: true },
  },
});

export const SatPaymentFormSchema = new EntitySchema<SatPaymentForm>({
  class: SatPaymentForm,
  tableName: 'sat_catalog_payment_forms',
  schema: 'catalog',
  properties: {
    code: { primary: true, type: 'string' },
    name: { type: 'string' },
  },
});

export const SatPaymentMethodSchema = new EntitySchema<SatPaymentMethod>({
  class: SatPaymentMethod,
  tableName: 'sat_catalog_payment_methods',
  schema: 'catalog',
  properties: {
    code: { primary: true, type: 'string' },
    name: { type: 'string' },
  },
});

export const SatCfdiUsageSchema = new EntitySchema<SatCfdiUsage>({
  class: SatCfdiUsage,
  tableName: 'sat_catalog_usages',
  schema: 'catalog',
  properties: {
    code: { primary: true, type: 'string' },
    name: { type: 'string' },
  },
});
