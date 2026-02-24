import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TenantModule } from '@virteex/kernel-tenant';
import { JwtTenantMiddleware } from '@virteex/kernel-auth';
import { KafkaModule } from '@virteex/shared-infrastructure-kafka';
import { CatalogInfrastructureModule } from '@virteex/infra-catalog-infrastructure';
import { CatalogApplicationModule } from '@virteex/application-catalog-application';
import { CatalogPresentationModule } from '@virteex/api-catalog-presentation';
import { CatalogResolver } from './catalog.resolver';
import { SchemaService } from './schema.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    KafkaModule.forRoot({
      clientId: 'catalog-service',
      groupId: 'catalog-consumer',
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
      },
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isPostgres = configService.get('DB_DRIVER') === 'postgres';
        return {
          driver: isPostgres ? PostgreSqlDriver : SqliteDriver,
          host: isPostgres ? (configService.get<string>('CATALOG_DB_HOST') || configService.get<string>('DB_HOST')) : undefined,
          port: isPostgres ? (configService.get<number>('CATALOG_DB_PORT') || configService.get<number>('DB_PORT')) : undefined,
          user: isPostgres ? (configService.get<string>('CATALOG_DB_USER') || configService.get<string>('DB_USER')) : undefined,
          password: isPostgres ? (configService.get<string>('CATALOG_DB_PASSWORD') || configService.get<string>('DB_PASSWORD')) : undefined,
          dbName: (() => {
            const dbName = configService.get<string>('CATALOG_DB_NAME');
            if (!dbName) {
              throw new Error('CATALOG_DB_NAME environment variable is required.');
            }
            return dbName;
          })(),
          autoLoadEntities: true,
          driverOptions: (isPostgres && configService.get<boolean>('DB_SSL_ENABLED'))
            ? {
                connection: { ssl: { rejectUnauthorized: false } },
              }
            : undefined,
        };
      },
    }),
    TenantModule,
    CatalogInfrastructureModule,
    CatalogApplicationModule,
    CatalogPresentationModule,
  ],
  providers: [CatalogResolver, SchemaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtTenantMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
