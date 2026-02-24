import { Injectable, Inject } from '@nestjs/common';
import { FixedAsset, FixedAssetRepository, FIXED_ASSET_REPOSITORY } from '@virteex/domain-fixed-assets-domain';

export class CreateFixedAssetDto {
  tenantId!: string;
  name!: string;
  acquisitionCost!: string;
  depreciationRate!: number;
}

@Injectable()
export class CreateFixedAssetUseCase {
  constructor(
    @Inject(FIXED_ASSET_REPOSITORY) private readonly repository: FixedAssetRepository
  ) {}

  async execute(dto: CreateFixedAssetDto): Promise<FixedAsset> {
    const asset = new FixedAsset(dto.tenantId, dto.name, dto.acquisitionCost, dto.depreciationRate);
    await this.repository.save(asset);
    return asset;
  }
}
