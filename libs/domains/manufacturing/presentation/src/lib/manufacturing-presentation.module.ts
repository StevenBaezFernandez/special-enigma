import { Module } from '@nestjs/common';
import { ManufacturingController } from './controllers/manufacturing.controller';
import { ManufacturingApplicationModule } from '@virteex/manufacturing-application';
import { ManufacturingInfrastructureModule } from '@virteex/manufacturing-infrastructure';

@Module({
  imports: [ManufacturingApplicationModule, ManufacturingInfrastructureModule],
  controllers: [ManufacturingController],
})
export class ManufacturingPresentationModule {}
