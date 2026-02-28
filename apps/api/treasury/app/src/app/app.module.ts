import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TreasuryInfrastructureModule } from '@virteex/infra-treasury-infrastructure';
import { TreasuryPresentationModule } from '@virteex/api-treasury-presentation';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { FederationSupportModule } from '@virteex/shared-util-server-config';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: true,
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
export class AppModule {}
