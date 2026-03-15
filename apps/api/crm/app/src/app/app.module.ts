import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { LoggerModule } from 'nestjs-pino';
import { TerminusModule } from '@nestjs/terminus';
import { ServerConfigModule } from '@virteex/shared-util-server-server-config';
import { CrmPresentationModule } from '@virteex/domain-crm-presentation';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import depthLimit from 'graphql-depth-limit';
import { createComplexityRule, simpleEstimator } from 'graphql-query-complexity';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginLandingPageProductionDefault } from '@apollo/server/plugin/landingPage/default';
import { FederationSupportModule } from '@virteex/shared-util-server-server-config';
import { TenantModule } from '@virteex/kernel-tenant';
import { CanonicalTenantMiddleware } from '@virteex/kernel-auth';

@Module({
  imports: [
    TenantModule,
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      plugins: [
        process.env.NODE_ENV === 'production'
          ? ApolloServerPluginLandingPageProductionDefault({
              embed: true,
            })
          : ApolloServerPluginLandingPageLocalDefault({ embed: true }),
      ],
      autoSchemaFile: true,
      validationRules: [
        depthLimit(10),
        createComplexityRule({ maximumComplexity: 1000, estimators: [simpleEstimator({ defaultComplexity: 1 })] })
      ],
    }),
    FederationSupportModule,
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
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isPostgres = configService.get('DB_DRIVER') === 'postgres';
        return {
          driver: isPostgres ? PostgreSqlDriver : SqliteDriver,
          host: isPostgres ? (configService.get<string>('CRM_DB_HOST') || configService.get<string>('DB_HOST')) : undefined,
          port: isPostgres ? (configService.get<number>('CRM_DB_PORT') || configService.get<number>('DB_PORT')) : undefined,
          user: isPostgres ? (configService.get<string>('CRM_DB_USER') || configService.get<string>('DB_USER')) : undefined,
          password: isPostgres ? (configService.get<string>('CRM_DB_PASSWORD') || configService.get<string>('DB_PASSWORD')) : undefined,
          dbName: (() => {
            const dbName = configService.get<string>('CRM_DB_NAME');
            if (!dbName) {
              throw new Error('CRM_DB_NAME environment variable is required.');
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
    CrmPresentationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CanonicalTenantMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
