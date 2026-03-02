import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { PayrollInfrastructureModule } from '@virteex/domain-payroll-infrastructure';
import { PayrollPresentationModule } from '@virteex/domain-payroll-presentation';
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
      host: process.env.PAYROLL_DB_HOST,
      port: Number(process.env.PAYROLL_DB_PORT),
      user: process.env.PAYROLL_DB_USER,
      password: process.env.PAYROLL_DB_PASSWORD,
      dbName: process.env.PAYROLL_DB_NAME,
      autoLoadEntities: true,
    }),
    PayrollInfrastructureModule,
    PayrollPresentationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
