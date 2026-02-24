import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { FixedAssetsInfrastructureModule } from '@virteex/infra-fixed-assets-infrastructure';
import { FixedAssetsPresentationModule } from '@virteex/api-fixed-assets-presentation';
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
      host: process.env.FIXED_ASSETS_DB_HOST,
      port: Number(process.env.FIXED_ASSETS_DB_PORT),
      user: process.env.FIXED_ASSETS_DB_USER,
      password: process.env.FIXED_ASSETS_DB_PASSWORD,
      dbName: process.env.FIXED_ASSETS_DB_NAME,
      autoLoadEntities: true,
    }),
    FixedAssetsInfrastructureModule,
    FixedAssetsPresentationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
