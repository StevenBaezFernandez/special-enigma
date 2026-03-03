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

@Global()
@Module({
  providers: [
    TenantService,
    TenantOperationService,
    RoutingPlaneService,
    FailoverService,
    FinOpsService,
    MigrationOrchestratorService,
    TenantModelSubscriber,
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantRlsInterceptor,
    },
  ],
  exports: [TenantService, TenantOperationService, RoutingPlaneService, FailoverService, FinOpsService, MigrationOrchestratorService],
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
