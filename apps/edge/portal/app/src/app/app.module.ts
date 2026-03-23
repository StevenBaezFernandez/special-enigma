import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { BffCoreModule, ResilientHttpClient } from '@virteex/kernel-bff-core';
import { InventoryPresentationModule } from '@virteex/domain-inventory-presentation';
import { AccountingPresentationModule } from '@virteex/domain-accounting-presentation';
import { PurchasingPresentationModule } from '@virteex/domain-purchasing-presentation';
import { CatalogPresentationModule } from '@virteex/domain-catalog-presentation';
import { SubscriptionPresentationModule } from '@virteex/domain-subscription-presentation';
import { BiPresentationModule } from '@virteex/domain-bi-presentation';
import { BillingPresentationModule } from '@virteex/domain-billing-presentation';
import { CrmPresentationModule } from '@virteex/domain-crm-presentation';
import { ProjectsPresentationModule } from '@virteex/domain-projects-presentation';
import { AdminPresentationModule } from '@virteex/domain-admin-presentation';
import { FiscalPresentationModule } from '@virteex/domain-fiscal-presentation';
import { PayrollPresentationModule } from '@virteex/domain-payroll-presentation';
import { IdentityPresentationModule } from '@virteex/domain-identity-presentation';
import { ManufacturingPresentationModule } from '@virteex/domain-manufacturing-presentation';
import { TreasuryPresentationModule } from '@virteex/domain-treasury-presentation';
import { FixedAssetsPresentationModule } from '@virteex/domain-fixed-assets-presentation';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    BffCoreModule,
    InventoryPresentationModule,
    AccountingPresentationModule,
    PurchasingPresentationModule,
    CatalogPresentationModule,
    SubscriptionPresentationModule,
    BiPresentationModule,
    BillingPresentationModule,
    CrmPresentationModule,
    ProjectsPresentationModule,
    AdminPresentationModule,
    FiscalPresentationModule,
    PayrollPresentationModule,
    IdentityPresentationModule,
    ManufacturingPresentationModule,
    TreasuryPresentationModule,
    FixedAssetsPresentationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  constructor(private readonly httpClient: ResilientHttpClient) {}

  configure(consumer: MiddlewareConsumer) {
    // Implement proxy for POS domain which doesn't have a presentation module in the BFF
    // Using 'pos/(.*)' to ensure sub-routes are also proxied
    consumer
      .apply(async (req, res) => {
        // Forwarding /api/pos/* to http://localhost:3008/api/*
        // req.originalUrl will contain /api/pos/...
        // The service listens on /api/...
        const targetPath = req.originalUrl.replace('/api/pos', '/api');
        const targetUrl = `http://localhost:3008${targetPath}`;
        try {
          const data = await this.httpClient.request({
            method: req.method,
            url: targetUrl,
            data: req.body,
            headers: req.headers,
          });
          res.status(200).json(data);
        } catch (error: any) {
          res.status(error.status || 500).json(error.response || { message: error.message });
        }
      })
      .forRoutes('pos/(.*)');
  }
}
