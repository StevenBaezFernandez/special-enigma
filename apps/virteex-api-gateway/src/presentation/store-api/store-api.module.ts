import { Module } from '@nestjs/common';
import { StoreCatalogController } from './store-catalog.controller';

@Module({
  controllers: [StoreCatalogController],
})
export class StoreApiModule {}
