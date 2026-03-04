import { Module, Global, OnModuleInit } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TenantService } from './tenant.service';
import { TenantOperationService } from './tenant-operation.service';
import { RoutingPlaneService } from './routing-plane.service';
import { FailoverService } from './failover.service';
import { FinOpsService } from './finops.service';
import { MigrationOrchestratorService } from './migration-orchestrator.service';
import { TenantRlsInterceptor } from './interceptors/tenant-rls.interceptor';
import { TenantModelSubscriber } from './subscribers/tenant-model.subscriber';
import { EntityManager } from '@mikro-orm/core';
import { MigrationGuard } from './migration-guard';
import { DualWriteManager } from './dual-write-manager';
import { ResidencyComplianceService } from './residency-compliance.service';
import { ResidencyAuditorController } from './controllers/residency-auditor.controller';

@Global()
@Module({
  controllers: [ResidencyAuditorController],
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
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantRlsInterceptor,
    },
  ],
  exports: [
    TenantService,
    MigrationOrchestratorService,
    MigrationGuard,
    DualWriteManager,
    FailoverService,
    RoutingPlaneService,
    FinOpsService,
    ResidencyComplianceService,
  ],
})
export class TenantModule implements OnModuleInit {
  constructor(
    private readonly em: EntityManager,
    private readonly subscriber: TenantModelSubscriber
  ) {}

  onModuleInit() {
    this.em.getEventManager().registerSubscriber(this.subscriber);
  }
}
