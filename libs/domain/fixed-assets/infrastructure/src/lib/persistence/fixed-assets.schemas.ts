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
    code: { type: 'string' },
    purchaseDate: { type: 'Date' },
    purchaseCost: { type: 'number' },
    residualValue: { type: 'number' },
    usefulLifeMonths: { type: 'number' },
    createdAt: { type: 'Date' },
    updatedAt: { type: 'Date' },
    name: { type: 'string' },
    status: { enum: true, items: () => AssetStatus },
  },
});

export const DepreciationSchema = new EntitySchema<Depreciation>({
  class: Depreciation,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    assetId: { type: 'string' },
    date: { type: 'Date' },
    amount: { type: 'number' },
    accumulatedDepreciation: { type: 'number' },
    createdAt: { type: 'Date' },
  },
});
