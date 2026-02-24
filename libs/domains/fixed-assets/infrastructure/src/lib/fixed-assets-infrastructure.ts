import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { FixedAsset, FIXED_ASSET_REPOSITORY } from '@virteex/domain-fixed-assets-domain';
import { MikroOrmFixedAssetRepository } from './repositories/mikro-orm-fixed-asset.repository';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([FixedAsset])
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
