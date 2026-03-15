import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TreasuryInfrastructureModule } from '@virteex/domain-treasury-infrastructure';
import { TreasuryPresentationModule } from '@virteex/domain-treasury-presentation';
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
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot({
      driver: PostgreSqlDriver,
      host: process.env.TREASURY_DB_HOST,
      port: Number(process.env.TREASURY_DB_PORT),
      user: process.env.TREASURY_DB_USER,
      password: process.env.TREASURY_DB_PASSWORD,
      dbName: process.env.TREASURY_DB_NAME,
      autoLoadEntities: true,
    }),
    TreasuryInfrastructureModule,
    TreasuryPresentationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CanonicalTenantMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
