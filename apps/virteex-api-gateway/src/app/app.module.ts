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
import { JwtAuthGuard, JwtTenantMiddleware } from '@virteex/auth';
import { TenantRlsInterceptor, TenantModule, TenantThrottlerGuard } from '@virteex/tenant';
import { KafkaModule } from '@virteex/shared/infrastructure/kafka';
import { AuditModule } from '@virteex/audit';
import { AppController } from './app.controller';
import { HealthController } from './health.controller';
import { AppService } from './app.service';
import { InitialSeederService } from './seeds/initial-seeder.service';

// Cross Domain Infrastructure (Application Level)
import { CrossDomainInfrastructureModule } from './infrastructure/cross-domain.module';

// BFF Modules
import { StoreApiModule } from '../presentation/store-api/store-api.module';

@Module({
  imports: [
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
                connection: { ssl: { rejectUnauthorized: false } },
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
  }
}
