import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { BiInfrastructureModule } from '@virteex/bi-infrastructure';
import { BiPresentationModule } from '@virteex/bi-presentation';
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
      host: process.env.BI_DB_HOST,
      port: Number(process.env.BI_DB_PORT),
      user: process.env.BI_DB_USER,
      password: process.env.BI_DB_PASSWORD,
      dbName: process.env.BI_DB_NAME,
      autoLoadEntities: true,
    }),
    BiInfrastructureModule,
    BiPresentationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
