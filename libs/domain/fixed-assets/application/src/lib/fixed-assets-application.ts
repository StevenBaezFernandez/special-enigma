import { Module } from '@nestjs/common';
import { CreateFixedAssetUseCase } from './use-cases/create-fixed-asset.use-case';
import { GetFixedAssetsUseCase } from './use-cases/get-fixed-assets.use-case';

@Module({
  providers: [CreateFixedAssetUseCase, GetFixedAssetsUseCase],
  exports: [CreateFixedAssetUseCase, GetFixedAssetsUseCase]
})
export class FixedAssetsApplicationModule {}
