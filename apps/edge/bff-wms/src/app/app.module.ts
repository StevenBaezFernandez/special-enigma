import { Module } from '@nestjs/common';
import { BffCoreModule } from '@virteex/kernel-bff-core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WmsApiModule } from './wms-api.module';

@Module({
  imports: [BffCoreModule, WmsApiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
