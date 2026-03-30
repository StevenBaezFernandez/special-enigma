import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { GraphQLModule } from '@nestjs/graphql';
import depthLimit from 'graphql-depth-limit';
import {
  createComplexityRule,
  simpleEstimator,
} from 'graphql-query-complexity';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AccountingInfrastructureModule } from '@virteex/domain-accounting-infrastructure';
import { AccountingApplicationModule } from '@virteex/domain-accounting-application';
import { AccountingPresentationModule } from '@virteex/domain-accounting-presentation';
import { TenantModule } from '@virteex/kernel-tenant';
import { AuthModule, CanonicalTenantMiddleware } from '@virteex/kernel-auth';
import { ServerConfigModule } from '@virteex/shared-util-server-server-config';

const DEFAULT_ACCOUNTING_DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  dbName: 'virteex_accounting',
} as const;

function getDatabasePort(): number {
  const configuredPort = Number(process.env.ACCOUNTING_DB_PORT);
  return Number.isFinite(configuredPort) && configuredPort > 0
    ? configuredPort
    : DEFAULT_ACCOUNTING_DB_CONFIG.port;
}

function shouldConnectDatabase(): boolean {
  if (process.env.ACCOUNTING_DB_CONNECT === 'true') {
    return true;
  }

  if (process.env.ACCOUNTING_DB_CONNECT === 'false') {
    return false;
  }

  return process.env.NODE_ENV === 'production';
}

@Module({
  imports: [
    ServerConfigModule,
    TenantModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
      },
      validationRules: [
        depthLimit(10),
        createComplexityRule({
          maximumComplexity: 1000,
          estimators: [simpleEstimator({ defaultComplexity: 1 })],
        }),
      ],
    }),
    MikroOrmModule.forRoot({
      driver: PostgreSqlDriver,
      host: process.env.ACCOUNTING_DB_HOST || DEFAULT_ACCOUNTING_DB_CONFIG.host,
      port: getDatabasePort(),
      user: process.env.ACCOUNTING_DB_USER || DEFAULT_ACCOUNTING_DB_CONFIG.user,
      password:
        process.env.ACCOUNTING_DB_PASSWORD ||
        DEFAULT_ACCOUNTING_DB_CONFIG.password,
      dbName:
        process.env.ACCOUNTING_DB_NAME || DEFAULT_ACCOUNTING_DB_CONFIG.dbName,
      connect: shouldConnectDatabase(),
      autoLoadEntities: true,
    }),
    EventEmitterModule.forRoot(),
    AccountingInfrastructureModule,
    AccountingApplicationModule,
    AccountingPresentationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CanonicalTenantMiddleware)
      .forRoutes({ path: '(.*)', method: RequestMethod.ALL });
  }
}
