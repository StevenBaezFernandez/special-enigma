import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { AdminPresentationModule } from '@virteex/domain-admin-presentation';
import { TenantModule, Tenant, TenantControlRecord, TenantOperation } from '@virteex/kernel-tenant';
import { CanonicalTenantMiddleware, AuthModule } from '@virteex/kernel-auth';
import { TenantConfig, Incident } from '@virteex/domain-admin-domain';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      entities: [Tenant, TenantControlRecord, TenantOperation, TenantConfig, Incident],
      dbName: 'virteex_admin',
      driver: PostgreSqlDriver,
      allowGlobalContext: true,
      connect: true,
    }),
    AuthModule,
    TenantModule,
    AdminPresentationModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CanonicalTenantMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
