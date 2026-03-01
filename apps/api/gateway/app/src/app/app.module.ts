import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServerConfigModule, IdempotencyInterceptor } from '@virteex/shared-util-server-config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { EventEmitterModule } from '@nestjs/event-emitter';
import * as depthLimit from 'graphql-depth-limit';
import { createComplexityLimitRule } from 'graphql-query-complexity';
import { JwtAuthGuard, JwtTenantMiddleware } from '@virteex/kernel-auth';
import { TenantRlsInterceptor, TenantModule, TenantThrottlerGuard } from '@virteex/kernel-tenant';
import { KafkaModule } from '@virteex/shared-infrastructure-kafka';
import { AuditModule } from '@virteex/kernel-audit';
import { InventoryPresentationModule } from '@virteex/api-inventory-presentation';
import { AccountingPresentationModule } from '@virteex/api-accounting-presentation';
import { AppController } from './app.controller';
import { HealthController } from './health.controller';
import { AppService } from './app.service';
import { InitialSeederService } from '@virteex/infra-payroll-infrastructure';

// Cross Domain Infrastructure (Application Level)
import { CrossDomainInfrastructureModule } from './infrastructure/cross-domain.module';

// BFF Modules
import { StoreApiModule } from '../presentation/store-api/store-api.module';
import { createServiceProxy } from './middleware/proxy.middleware';

@Module({
  imports: [
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

    // Core Modules
    TenantModule,

    // Cross Domain Infrastructure
    CrossDomainInfrastructureModule,

    // BFF Modules
    StoreApiModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    InitialSeederService,
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
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtTenantMiddleware)
      .forRoutes('*');

    // Proxy Routes for Microservices
    // consumer.apply(createServiceProxy('http://virteex-accounting-service:3000')).forRoutes('accounting'); // Running in-process
    // consumer.apply(createServiceProxy('http://virteex-payroll-service:3000')).forRoutes('payroll'); // Migrated to GraphQL Federation
    consumer.apply(createServiceProxy('http://virteex-crm-service:3000')).forRoutes('crm');
    consumer.apply(createServiceProxy('http://virteex-projects-service:3000')).forRoutes('projects');
    consumer.apply(createServiceProxy('http://virteex-manufacturing-service:3000')).forRoutes('manufacturing');
    // consumer.apply(createServiceProxy('http://virteex-inventory-service:3000')).forRoutes('inventory'); // Running in-process

    // Proxy for GraphQL Gateway
    // Assuming virteex-gateway runs on port 3000 and has global prefix 'api', exposing GraphQL at '/api/graphql'
    // This proxy forwards '/graphql' requests to 'http://virteex-gateway:3000/api/graphql'
    // Note: createServiceProxy with pathRewrite might be needed if exact mapping fails,
    // but here we target the base URL. If request is /graphql, and target is .../api, it becomes .../api/graphql
    consumer.apply(createServiceProxy('http://virteex-gateway:3000/api')).forRoutes('graphql');

    // consumer.apply(createServiceProxy('http://virteex-treasury-service:3000')).forRoutes('treasury'); // Migrated to GraphQL Federation
    // consumer.apply(createServiceProxy('http://virteex-purchasing-service:3000')).forRoutes('purchasing'); // Migrated to GraphQL Federation
    consumer.apply(createServiceProxy('http://virteex-bi-service:3000')).forRoutes('bi');
    consumer.apply(createServiceProxy('http://virteex-admin-service:3000')).forRoutes('admin');
    consumer.apply(createServiceProxy('http://virteex-fixed-assets-service:3000')).forRoutes('fixed-assets');
  }
}
