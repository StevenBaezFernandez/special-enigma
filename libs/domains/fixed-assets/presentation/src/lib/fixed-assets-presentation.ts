import { Module } from '@nestjs/common';
import { FixedAssetsController } from './controllers/fixed-assets.controller';
import { FixedAssetsApplicationModule } from '@virteex/application-fixed-assets-application';
import { FixedAssetsInfrastructureModule } from '@virteex/infra-fixed-assets-infrastructure';

@Module({
  imports: [FixedAssetsApplicationModule, FixedAssetsInfrastructureModule],
  controllers: [FixedAssetsController],
})
export class FixedAssetsPresentationModule {}
