import { Module } from '@nestjs/common';
import { BffCoreModule } from '@virteex/kernel-bff-core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StoreApiModule } from './store-api.module';

@Module({
  imports: [BffCoreModule, StoreApiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
