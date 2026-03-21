import { Module } from '@nestjs/common';
import { BffCoreModule } from '@virteex/kernel-bff-core';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [BffCoreModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
