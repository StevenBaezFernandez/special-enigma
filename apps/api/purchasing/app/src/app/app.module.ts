import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { PurchasingInfrastructureModule } from '@virteex/domain-purchasing-infrastructure';
import { PurchasingPresentationModule } from '@virteex/domain-purchasing-presentation';
import { GraphQLModule } from '@nestjs/graphql';
import depthLimit from 'graphql-depth-limit';
import pkg from 'graphql-query-complexity'; const { createComplexityLimitRule } = pkg;
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { FederationSupportModule } from '@virteex/shared-util-server-server-config';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: true,
      validationRules: [
        depthLimit(10),
        createComplexityLimitRule(1000)
      ],
    }),
    FederationSupportModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot({
      driver: PostgreSqlDriver,
      host: process.env.PURCHASING_DB_HOST,
      port: Number(process.env.PURCHASING_DB_PORT),
      user: process.env.PURCHASING_DB_USER,
      password: process.env.PURCHASING_DB_PASSWORD,
      dbName: process.env.PURCHASING_DB_NAME,
      autoLoadEntities: true,
    }),
    PurchasingInfrastructureModule,
    PurchasingPresentationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
