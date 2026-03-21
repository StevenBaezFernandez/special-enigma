import { Module } from '@nestjs/common';
import { WmsInventoryController } from './wms-inventory.controller';

@Module({
  controllers: [WmsInventoryController],
})
export class WmsApiModule {}
