import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TenantConfig, TENANT_CONFIG_REPOSITORY, INTEGRATION_GATEWAY } from '@virteex/admin-domain';
import { MikroOrmTenantConfigRepository } from './repositories/mikro-orm-tenant-config.repository';
import { HttpIntegrationAdapter } from './adapters/http-integration.adapter';

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
    }
  ],
  exports: [
    MikroOrmModule,
    TENANT_CONFIG_REPOSITORY,
    INTEGRATION_GATEWAY
  ]
})
export class AdminInfrastructureModule {}
