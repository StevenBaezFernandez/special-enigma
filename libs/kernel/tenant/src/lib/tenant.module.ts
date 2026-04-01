import { Module, Global, OnModuleInit } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { EntityManager } from '@mikro-orm/core';
import { TenantService } from './tenant.service';
import { TenantOperationService } from './tenant-operation.service';
import { RoutingPlaneService } from './routing-plane.service';
import { FailoverService } from './failover.service';
import { FinOpsService } from './finops.service';
import { MigrationOrchestratorService } from './migration-orchestrator.service';
import { TenantRlsInterceptor } from './interceptors/tenant-rls.interceptor';
import { TenantModelSubscriber } from './subscribers/tenant-model.subscriber';
import { MigrationGuard } from './migration-guard';
import { DualWriteManager } from './dual-write-manager';
import { TenantCriticalConfigService } from './tenant-critical-config.service';
import { ResidencyComplianceService } from './residency-compliance.service';
import { ResidencyAuditorController } from './controllers/residency-auditor.controller';
import { FeatureFlagsController } from './controllers/feature-flags.controller';
import { TelemetryModule } from '@virteex/kernel-telemetry';
import { AuthModule } from '@virteex/kernel-auth';
import { EntitlementsModule } from '@virteex/kernel-entitlements';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Tenant } from './entities/tenant.entity';
import { TenantControlRecord } from './entities/tenant-control-record.entity';
import { TenantOperation } from './entities/tenant-operation.entity';
import { TenantRoutingSnapshot } from './entities/tenant-routing-snapshot.entity';

@Global()
@Module({
  imports: [
    ConfigModule,
    TelemetryModule,
    AuthModule,
    EntitlementsModule,
    MikroOrmModule.forFeature([
      Tenant,
      TenantControlRecord,
      TenantOperation,
      TenantRoutingSnapshot,
    ]),
  ],
  controllers: [ResidencyAuditorController, FeatureFlagsController],
  providers: [
    TenantService,
    TenantOperationService,
    RoutingPlaneService,
    FailoverService,
    FinOpsService,
    MigrationOrchestratorService,
    MigrationGuard,
    DualWriteManager,
    ResidencyComplianceService,
    TenantModelSubscriber,
    TenantCriticalConfigService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantRlsInterceptor,
    },
  ],
  exports: [
    TenantService,
    TenantOperationService,
    MigrationOrchestratorService,
    MigrationGuard,
    DualWriteManager,
    FailoverService,
    RoutingPlaneService,
    FinOpsService,
    TenantCriticalConfigService,
    ResidencyComplianceService,
  ],
})
export class TenantModule implements OnModuleInit {
  constructor(
    private readonly em: EntityManager,
    private readonly subscriber: TenantModelSubscriber,
  ) {}

  onModuleInit() {
    this.em.getEventManager().registerSubscriber(this.subscriber);
  }
}
