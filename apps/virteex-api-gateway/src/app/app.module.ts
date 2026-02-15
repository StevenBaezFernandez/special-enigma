import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServerConfigModule } from '@virteex/shared-util-server-config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { TerminusModule } from '@nestjs/terminus';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtAuthGuard } from '@virteex/auth';
import { AppController } from './app.controller';
import { HealthController } from './health.controller';
import { AppService } from './app.service';
import { InitialSeederService } from './seeds/initial-seeder.service';

// Domain Modules - Infrastructure
import { BillingDomainModule } from '@virteex/billing-domain';
import { BillingInfrastructureModule } from '@virteex/billing-infrastructure';
import { ProjectsInfrastructureModule } from '@virteex/projects-infrastructure';
import { ManufacturingInfrastructureModule } from '@virteex/manufacturing-infrastructure';
import { FixedAssetsInfrastructureModule } from '@virteex/fixed-assets-infrastructure';
import { BiInfrastructureModule } from '@virteex/bi-infrastructure';
import { AdminInfrastructureModule } from '@virteex/admin-infrastructure';
import { FiscalInfrastructureModule } from '@virteex/fiscal-infrastructure';
import { AccountingInfrastructureModule } from '@virteex/accounting-infrastructure';
import { InventoryInfrastructureModule } from '@virteex/inventory-infrastructure';
import { PayrollInfrastructureModule } from '@virteex/payroll-infrastructure';
import { CrmInfrastructureModule } from '@virteex/crm-infrastructure';
import { TreasuryInfrastructureModule } from '@virteex/treasury-infrastructure';
import { PurchasingInfrastructureModule } from '@virteex/purchasing-infrastructure';
import { CatalogInfrastructureModule } from '@virteex/catalog-infrastructure';
import { IdentityInfrastructureModule } from '@virteex/identity-infrastructure';

// Domain Modules - Presentation
import { BillingPresentationModule } from '@virteex/billing-presentation';
import { IdentityPresentationModule } from '@virteex/identity-presentation';
import { FixedAssetsPresentationModule } from '@virteex/fixed-assets-presentation';
import { AccountingPresentationModule } from '@virteex/accounting-presentation';
import { InventoryPresentationModule } from '@virteex/inventory-presentation';
import { PayrollPresentationModule } from '@virteex/payroll-presentation';
import { CrmPresentationModule } from '@virteex/crm-presentation';
import { TreasuryPresentationModule } from '@virteex/treasury-presentation';
import { ProjectsPresentationModule } from '@virteex/projects-presentation';
import { PurchasingPresentationModule } from '@virteex/purchasing-presentation';
import { ManufacturingPresentationModule } from '@virteex/manufacturing-presentation';
import { BiPresentationModule } from '@virteex/bi-presentation';
import { AdminPresentationModule } from '@virteex/admin-presentation';
import { FiscalPresentationModule } from '@virteex/fiscal-presentation';
import { CatalogPresentationModule } from '@virteex/catalog-presentation';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty' }
          : undefined,
      },
    }),
    TerminusModule,
    EventEmitterModule.forRoot(),
    ServerConfigModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isPostgres = configService.get('DB_DRIVER') === 'postgres';
        return {
          driver: isPostgres ? PostgreSqlDriver : SqliteDriver,
          host: isPostgres ? configService.get<string>('DB_HOST') : undefined,
          port: isPostgres ? configService.get<number>('DB_PORT') : undefined,
          user: isPostgres ? configService.get<string>('DB_USER') : undefined,
          password: isPostgres ? configService.get<string>('DB_PASSWORD') : undefined,
          dbName: configService.get<string>('DB_NAME') || (isPostgres ? 'virteex' : 'virteex.db'),
          autoLoadEntities: true,
          driverOptions: (isPostgres && configService.get<boolean>('DB_SSL_ENABLED'))
            ? {
                connection: { ssl: { rejectUnauthorized: false } },
              }
            : undefined,
        };
      },
    }),

    // Infrastructure Modules
    BillingInfrastructureModule,
    ProjectsInfrastructureModule,
    ManufacturingInfrastructureModule,
    FixedAssetsInfrastructureModule,
    BiInfrastructureModule,
    AdminInfrastructureModule,
    FiscalInfrastructureModule,
    AccountingInfrastructureModule,
    InventoryInfrastructureModule,
    PayrollInfrastructureModule,
    CrmInfrastructureModule,
    TreasuryInfrastructureModule,
    PurchasingInfrastructureModule,
    CatalogInfrastructureModule,
    IdentityInfrastructureModule,

    // Domain Definition Modules (if needed)
    BillingDomainModule,

    // Presentation Modules
    BillingPresentationModule,
    IdentityPresentationModule,
    FixedAssetsPresentationModule,
    AccountingPresentationModule,
    InventoryPresentationModule,
    PayrollPresentationModule,
    CrmPresentationModule,
    TreasuryPresentationModule,
    ProjectsPresentationModule,
    PurchasingPresentationModule,
    ManufacturingPresentationModule,
    BiPresentationModule,
    AdminPresentationModule,
    FiscalPresentationModule,
    CatalogPresentationModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    InitialSeederService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
