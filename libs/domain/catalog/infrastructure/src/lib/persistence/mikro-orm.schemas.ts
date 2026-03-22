import { EntitySchema, t } from '@mikro-orm/core';
import { Product, SatPaymentForm, SatPaymentMethod, SatCfdiUsage, Plugin, PluginVersion, PluginStatus, PluginChannel } from '@virteex/domain-catalog-domain';

export const PluginSchema = new EntitySchema<Plugin>({
  class: Plugin,
  schema: 'catalog',
  properties: {
    id: { primary: true, type: 'string' },
    name: { type: 'string' },
    description: { type: 'string', nullable: true },
    author: { type: 'string', nullable: true },
    status: { enum: true, items: () => PluginStatus, default: PluginStatus.ACTIVE },
    versions: { reference: '1:m', entity: 'PluginVersion', mappedBy: 'plugin' },
    createdAt: { type: 'datetime', onCreate: () => new Date() },
    updatedAt: { type: 'datetime', onCreate: () => new Date(), onUpdate: () => new Date() },
  },
});

export const PluginVersionSchema = new EntitySchema<PluginVersion>({
  class: PluginVersion,
  schema: 'catalog',
  properties: {
    id: { primary: true, type: 'string' },
    plugin: { reference: 'm:1', entity: 'Plugin' },
    version: { type: 'string' },
    code: { type: 'text' },
    capabilities: { type: t.json, nullable: true },
    sbom: { type: t.json, nullable: true },
    signature: { type: 'string', nullable: true },
    channel: { enum: true, items: () => PluginChannel, default: PluginChannel.STABLE },
    createdAt: { type: 'datetime', onCreate: () => new Date() },
  },
});

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
