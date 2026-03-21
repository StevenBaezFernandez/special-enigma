import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { BffCoreModule, ResilientHttpClient } from '@virteex/kernel-bff-core';
import { InventoryPresentationModule } from '@virteex/domain-inventory-presentation';
import { AccountingPresentationModule } from '@virteex/domain-accounting-presentation';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    BffCoreModule,
    InventoryPresentationModule,
    AccountingPresentationModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  constructor(private readonly httpClient: ResilientHttpClient) {}

  configure(consumer: MiddlewareConsumer) {
    // Legacy HTTP proxies move to BFF-Portal as well (for now)
    // - CRM
    // - Projects
    // - BI
    // - Admin
    // - Fixed Assets
  }
}
