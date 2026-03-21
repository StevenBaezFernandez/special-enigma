import { Module } from '@nestjs/common';
import { BffCoreModule } from '@virteex/kernel-bff-core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShopfloorApiModule } from './shopfloor-api.module';

@Module({
  imports: [BffCoreModule, ShopfloorApiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
