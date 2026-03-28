import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TenantConfig, Incident, TENANT_CONFIG_REPOSITORY, INTEGRATION_GATEWAY, DASHBOARD_GATEWAY, DATABASE_PORT } from '@virteex/domain-admin-domain';
import { MikroOrmTenantConfigRepository } from './persistence/repositories/mikro-orm-tenant-config.repository';
import { HttpIntegrationAdapter } from './integrations/adapters/http-integration.adapter';
import { HttpDashboardGateway } from './integrations/adapters/http-dashboard.gateway';
import { MikroOrmDatabaseAdapter } from './tenancy/mikro-orm-database.adapter';

export function adminInfrastructure(): string {
  return 'admin-infrastructure';
}

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([TenantConfig, Incident]),
    HttpModule,
    ConfigModule
  ],
  providers: [
    {
      provide: TENANT_CONFIG_REPOSITORY,
      useClass: MikroOrmTenantConfigRepository
    },
    {
      provide: INTEGRATION_GATEWAY,
      useClass: HttpIntegrationAdapter
    },
    {
      provide: DASHBOARD_GATEWAY,
      useClass: HttpDashboardGateway
    },
    {
      provide: DATABASE_PORT,
      useClass: MikroOrmDatabaseAdapter
    }
  ],
  exports: [
    MikroOrmModule,
    TENANT_CONFIG_REPOSITORY,
    INTEGRATION_GATEWAY,
    DASHBOARD_GATEWAY,
    DATABASE_PORT
  ]
})
export class AdminInfrastructureModule {}
