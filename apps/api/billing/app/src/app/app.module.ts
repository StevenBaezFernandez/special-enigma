import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { LoggerModule } from 'nestjs-pino';
import { TerminusModule } from '@nestjs/terminus';
import { ServerConfigModule } from '@virteex/shared-util-server-server-config';
import { KafkaModule } from '@virteex/platform-kafka';
import { GraphQLModule } from '@nestjs/graphql';
import depthLimit from 'graphql-depth-limit';
import pkg from 'graphql-query-complexity'; const { createComplexityLimitRule } = pkg;
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { BillingPresentationModule } from '@virteex/domain-billing-presentation';
import { BillingInfrastructureModule } from '@virteex/domain-billing-infrastructure';
import { BillingApplicationModule } from '@virteex/domain-billing-application';
import { InitialSeederService } from './seeds/initial-seeder.service';
import { OpsController } from './ops.controller';
import { OpsReadinessService } from './ops-readiness.service';
import { TenantModule } from '@virteex/kernel-tenant';
import { CanonicalTenantMiddleware } from '@virteex/kernel-auth';

@Module({
  imports: [
    TenantModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
        transport:
          process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
      },
    }),
    TerminusModule,
    ServerConfigModule,
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
      },
      validationRules: [
        depthLimit(10),
        createComplexityLimitRule(1000)
      ],
    }),
    KafkaModule.forRoot({
      clientId: 'billing-service',
      groupId: 'billing-service-consumer',
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isPostgres = configService.get('DB_DRIVER') === 'postgres';
        return {
          driver: isPostgres ? PostgreSqlDriver : SqliteDriver,
          host: isPostgres
            ? configService.get<string>('BILLING_DB_HOST') || configService.get<string>('DB_HOST')
            : undefined,
          port: isPostgres
            ? configService.get<number>('BILLING_DB_PORT') || configService.get<number>('DB_PORT')
            : undefined,
          user: isPostgres
            ? configService.get<string>('BILLING_DB_USER') || configService.get<string>('DB_USER')
            : undefined,
          password: isPostgres
            ? configService.get<string>('BILLING_DB_PASSWORD') ||
              configService.get<string>('DB_PASSWORD')
            : undefined,
          dbName: (() => {
            const dbName = configService.get<string>('BILLING_DB_NAME');
            if (!dbName) {
              throw new Error('BILLING_DB_NAME environment variable is required.');
            }
            return dbName;
          })(),
          autoLoadEntities: true,
          driverOptions:
            isPostgres && configService.get<boolean>('DB_SSL_ENABLED')
              ? {
                  connection: { ssl: { rejectUnauthorized: configService.get("DB_SSL_REJECT_UNAUTHORIZED") !== "false" } },
                }
              : undefined,
        };
      },
    }),
    BillingInfrastructureModule,
    BillingPresentationModule,
    BillingApplicationModule,
  ],
  controllers: [OpsController],
  providers: [InitialSeederService, OpsReadinessService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CanonicalTenantMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
