import { EntitySchema } from '@mikro-orm/core';
import { FixedAsset, Asset, Depreciation, AssetStatus } from '@virteex/domain-fixed-assets-domain';

export const FixedAssetSchema = new EntitySchema<FixedAsset>({
  class: FixedAsset,
  tableName: 'fixed_assets',
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    name: { type: 'string' },
    acquisitionDate: { type: 'Date' },
    acquisitionCost: { type: 'decimal', precision: 10, scale: 2 },
    depreciationRate: { type: 'number' },
    status: { enum: true, items: () => AssetStatus },
  },
});

export const AssetSchema = new EntitySchema<Asset>({
  class: Asset,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    fixedAssetId: { type: 'string' },
    serialNumber: { type: 'string' },
    location: { type: 'string' },
  },
});

export const DepreciationSchema = new EntitySchema<Depreciation>({
  class: Depreciation,
  properties: {
    id: { primary: true, type: 'uuid' },
    fixedAssetId: { type: 'string' },
    period: { type: 'string' },
    amount: { type: 'string' },
    accumulatedAmount: { type: 'string' },
    date: { type: 'Date' },
  },
});
