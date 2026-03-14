import { Injectable, Inject } from '@nestjs/common';
import { FixedAsset, type FixedAssetRepository, FIXED_ASSET_REPOSITORY } from '@virteex/domain-fixed-assets-domain';

@Injectable()
export class GetFixedAssetsUseCase {
  constructor(
    @Inject(FIXED_ASSET_REPOSITORY) private readonly repository: FixedAssetRepository
  ) {}

  async execute(): Promise<FixedAsset[]> {
    return this.repository.findAll();
  }
}
