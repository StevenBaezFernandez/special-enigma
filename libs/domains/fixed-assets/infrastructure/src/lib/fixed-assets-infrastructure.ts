import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { FIXED_ASSET_REPOSITORY } from '@virteex/domain-fixed-assets-domain';
import { MikroOrmFixedAssetRepository } from './repositories/mikro-orm-fixed-asset.repository';
import { FixedAssetOrmEntity } from './persistence/entities/fixed-asset.orm-entity';
import { AssetOrmEntity } from './persistence/entities/asset.orm-entity';
import { DepreciationOrmEntity } from './persistence/entities/depreciation.orm-entity';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([FixedAssetOrmEntity, AssetOrmEntity, DepreciationOrmEntity])
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
