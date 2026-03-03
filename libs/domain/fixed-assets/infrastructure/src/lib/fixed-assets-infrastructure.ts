import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { FIXED_ASSET_REPOSITORY } from '@virteex/domain-fixed-assets-domain';
import { MikroOrmFixedAssetRepository } from './repositories/mikro-orm-fixed-asset.repository';
import { FixedAssetSchema, AssetSchema, DepreciationSchema } from './persistence/fixed-assets.schemas';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([FixedAssetSchema, AssetSchema, DepreciationSchema])
  ],
  providers: [
    {
      provide: FIXED_ASSET_REPOSITORY,
      useClass: MikroOrmFixedAssetRepository
    }
  ],
  exports: [
    MikroOrmModule,
    FIXED_ASSET_REPOSITORY
  ]
})
export class FixedAssetsInfrastructureModule {}
