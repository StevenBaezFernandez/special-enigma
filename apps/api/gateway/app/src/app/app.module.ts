import { Module, MiddlewareConsumer, NestModule, Logger, RequestMethod } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServerConfigModule, IdempotencyInterceptor } from '@virteex/shared-util-server-server-config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule, JwtAuthGuard, CanonicalTenantMiddleware } from '@virteex/kernel-auth';
import { RoutingPlaneService, TenantRlsInterceptor, TenantModule, TenantThrottlerGuard } from '@virteex/kernel-tenant';
import { KafkaModule } from '@virteex/platform-kafka';
import { AuditModule } from '@virteex/kernel-audit';
import { InventoryPresentationModule } from '@virteex/domain-inventory-presentation';
import { AccountingPresentationModule } from '@virteex/domain-accounting-presentation';
import { AppController } from './app.controller';
import { HealthController } from './health.controller';
import { AppService } from './app.service';
import { CrossDomainInfrastructureModule } from './infrastructure/cross-domain.module';
import { StoreApiModule } from '../presentation/store-api/store-api.module';
import { createServiceProxy } from './middleware/proxy.middleware';

@Module({
  imports: [
    AuthModule,
    TenantModule,
    InventoryPresentationModule,
    AccountingPresentationModule,
    TerminusModule,
    EventEmitterModule.forRoot(),
    KafkaModule.forRoot({
      clientId: 'api-gateway',
      groupId: 'gateway-consumer',
    }),
    AuditModule,
    ServerConfigModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    MikroOrmModule.forRootAsync({
      driver: PostgreSqlDriver,
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
                connection: { ssl: { rejectUnauthorized: configService.get("DB_SSL_REJECT_UNAUTHORIZED") !== "false" } },
              }
            : undefined,
        };
      },
    }),
    TenantModule,
    CrossDomainInfrastructureModule,
    StoreApiModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: TenantThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantRlsInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  private readonly logger = new Logger(AppModule.name);

  constructor(private readonly routingPlane: RoutingPlaneService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CanonicalTenantMiddleware)
      .forRoutes('*');

    // UNIFIED GATEWAY STRATEGY:
    // Domain services are being migrated to GraphQL Federation (virteex-gateway).
    // Legacy HTTP proxies are kept only for non-migrated or specialized REST endpoints.

    // Services already in Federation (Preferred route via /graphql)
    // - Accounting
    // - Payroll
    // - Treasury
    // - Purchasing

    // Services still using Proxy (Pending Federation migration)
    const federationUrl = process.env['FEDERATION_GATEWAY_URL'] || 'http://virteex-gateway:3000/api';

    consumer.apply(createServiceProxy({ service: 'graphql', target: federationUrl, routingPlane: this.routingPlane })).forRoutes('graphql');

    // Legacy/REST Proxies
    consumer.apply(createServiceProxy({ service: 'crm', target: 'http://virteex-crm-service:3000', routingPlane: this.routingPlane })).forRoutes('crm');
    consumer.apply(createServiceProxy({ service: 'projects', target: 'http://virteex-projects-service:3000', routingPlane: this.routingPlane })).forRoutes('projects');
    consumer.apply(createServiceProxy({ service: 'manufacturing', target: 'http://virteex-manufacturing-service:3000', routingPlane: this.routingPlane })).forRoutes('manufacturing');
    consumer.apply(createServiceProxy({ service: 'bi', target: 'http://virteex-bi-service:3000', routingPlane: this.routingPlane })).forRoutes('bi');
    consumer.apply(createServiceProxy({ service: 'admin', target: 'http://virteex-admin-service:3000', routingPlane: this.routingPlane })).forRoutes('admin');
    consumer.apply(createServiceProxy({ service: 'fixed-assets', target: 'http://virteex-fixed-assets-service:3000', routingPlane: this.routingPlane })).forRoutes('fixed-assets');

    this.logger.log('API Gateway configured with Hybrid Strategy (Federation + Proxy).');
  }
}
