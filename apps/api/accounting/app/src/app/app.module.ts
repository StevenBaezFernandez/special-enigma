import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { GraphQLModule } from '@nestjs/graphql';
import depthLimit from 'graphql-depth-limit';
import pkg from 'graphql-query-complexity'; const { createComplexityLimitRule } = pkg;
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { AccountingInfrastructureModule } from '@virteex/domain-accounting-infrastructure';
import { AccountingPresentationModule } from '@virteex/domain-accounting-presentation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: true,
      validationRules: [
        depthLimit(10),
        createComplexityLimitRule(1000)
      ],
    }),
    MikroOrmModule.forRoot({
      driver: PostgreSqlDriver,
      host: process.env.ACCOUNTING_DB_HOST,
      port: Number(process.env.ACCOUNTING_DB_PORT),
      user: process.env.ACCOUNTING_DB_USER,
      password: process.env.ACCOUNTING_DB_PASSWORD,
      dbName: process.env.ACCOUNTING_DB_NAME,
      autoLoadEntities: true,
    }),
    AccountingInfrastructureModule,
    AccountingPresentationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
