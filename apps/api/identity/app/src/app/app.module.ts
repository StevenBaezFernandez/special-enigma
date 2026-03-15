import { Module, MiddlewareConsumer, RequestMethod, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GraphQLModule } from '@nestjs/graphql';
import depthLimit from 'graphql-depth-limit';
import { createComplexityRule, simpleEstimator } from 'graphql-query-complexity';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginLandingPageProductionDefault } from '@apollo/server/plugin/landingPage/default';
import { TenantModule } from '@virteex/kernel-tenant';
import { CanonicalTenantMiddleware } from '@virteex/kernel-auth';
import { IdentityPresentationModule } from '@virteex/domain-identity-presentation';
import { IdentityInfrastructureModule } from '@virteex/domain-identity-infrastructure';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TenantModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    EventEmitterModule.forRoot(),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      plugins: [
        process.env.NODE_ENV === 'production'
          ? ApolloServerPluginLandingPageProductionDefault({
              embed: true,
            })
          : ApolloServerPluginLandingPageLocalDefault({ embed: true }),
      ],
      autoSchemaFile: {
        federation: 2,
      },
      validationRules: [
        depthLimit(10),
        createComplexityRule({ maximumComplexity: 1000, estimators: [simpleEstimator({ defaultComplexity: 1 })] })
      ],
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isPostgres = configService.get('DB_DRIVER') === 'postgres';
        return {
          driver: isPostgres ? PostgreSqlDriver : SqliteDriver,
          host: isPostgres ? (configService.get<string>('IDENTITY_DB_HOST') || configService.get<string>('DB_HOST')) : undefined,
          port: isPostgres ? (configService.get<number>('IDENTITY_DB_PORT') || configService.get<number>('DB_PORT')) : undefined,
          user: isPostgres ? (configService.get<string>('IDENTITY_DB_USER') || configService.get<string>('DB_USER')) : undefined,
          password: isPostgres ? (configService.get<string>('IDENTITY_DB_PASSWORD') || configService.get<string>('DB_PASSWORD')) : undefined,
          dbName: (() => {
            const dbName = configService.get<string>('IDENTITY_DB_NAME');
            if (!dbName) {
              throw new Error('IDENTITY_DB_NAME environment variable is required.');
            }
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
    TenantModule,
    IdentityInfrastructureModule,
    IdentityPresentationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CanonicalTenantMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
