import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TenantConfig, TENANT_CONFIG_REPOSITORY, INTEGRATION_GATEWAY, DASHBOARD_GATEWAY } from '@virteex/domain-admin-domain';
import { MikroOrmTenantConfigRepository } from './repositories/mikro-orm-tenant-config.repository';
import { HttpIntegrationAdapter } from './adapters/http-integration.adapter';
import { HttpDashboardGateway } from './adapters/http-dashboard.gateway';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([TenantConfig]),
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
    }
  ],
  exports: [
    MikroOrmModule,
    TENANT_CONFIG_REPOSITORY,
    INTEGRATION_GATEWAY,
    DASHBOARD_GATEWAY
  ]
})
export class AdminInfrastructureModule {}
