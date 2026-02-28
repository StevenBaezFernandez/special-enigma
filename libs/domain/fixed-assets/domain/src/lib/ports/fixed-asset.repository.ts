import { FixedAsset } from '../entities/fixed-asset.entity';

export const FIXED_ASSET_REPOSITORY = 'FIXED_ASSET_REPOSITORY';

export interface FixedAssetRepository {
  save(asset: FixedAsset): Promise<void>;
  findAll(): Promise<FixedAsset[]>;
}
