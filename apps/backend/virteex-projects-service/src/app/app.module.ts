import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { ProjectsInfrastructureModule } from '@virteex/infra-projects-infrastructure';
import { ProjectsPresentationModule } from '@virteex/api-projects-presentation';
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
      host: process.env.PROJECTS_DB_HOST,
      port: Number(process.env.PROJECTS_DB_PORT),
      user: process.env.PROJECTS_DB_USER,
      password: process.env.PROJECTS_DB_PASSWORD,
      dbName: process.env.PROJECTS_DB_NAME,
      autoLoadEntities: true,
    }),
    ProjectsInfrastructureModule,
    ProjectsPresentationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
