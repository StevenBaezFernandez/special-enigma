import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { LoggerModule } from 'nestjs-pino';
import { TerminusModule } from '@nestjs/terminus';
import { ServerConfigModule } from '@virteex/shared-util-server-server-config';
import { GraphQLModule } from '@nestjs/graphql';
import depthLimit from 'graphql-depth-limit';
import pkg from 'graphql-query-complexity'; const { createComplexityLimitRule } = pkg;
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { SubscriptionPresentationModule } from '@virteex/domain-subscription-presentation';
import { SubscriptionInfrastructureModule } from '@virteex/domain-subscription-infrastructure';
import { SubscriptionApplicationModule } from '@virteex/domain-subscription-application';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty' }
          : undefined,
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
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isPostgres = configService.get('DB_DRIVER') === 'postgres';
        return {
          driver: isPostgres ? PostgreSqlDriver : SqliteDriver,
          host: isPostgres ? (configService.get<string>('SUBSCRIPTION_DB_HOST') || configService.get<string>('DB_HOST')) : undefined,
          port: isPostgres ? (configService.get<number>('SUBSCRIPTION_DB_PORT') || configService.get<number>('DB_PORT')) : undefined,
          user: isPostgres ? (configService.get<string>('SUBSCRIPTION_DB_USER') || configService.get<string>('DB_USER')) : undefined,
          password: isPostgres ? (configService.get<string>('SUBSCRIPTION_DB_PASSWORD') || configService.get<string>('DB_PASSWORD')) : undefined,
          dbName: (() => {
            const dbName = configService.get<string>('SUBSCRIPTION_DB_NAME') || 'virteex_subscription';
            return dbName;
          })(),
          autoLoadEntities: true,
          driverOptions: (isPostgres && configService.get<boolean>('DB_SSL_ENABLED'))
            ? {
                connection: { ssl: { rejectUnauthorized: configService.get("DB_SSL_REJECT_UNAUTHORIZED") !== "false" } },
              }
            : undefined,
        };
      },
    }),
    SubscriptionInfrastructureModule,
    SubscriptionPresentationModule,
    SubscriptionApplicationModule,
  ],
  providers: [],
})
export class AppModule {}
