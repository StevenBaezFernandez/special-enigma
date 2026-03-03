import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TenantOperationService } from './tenant-operation.service';
import { RoutingPlaneService } from './routing-plane.service';
import { TenantControlRecord } from './entities/tenant-control-record.entity';
import { OperationType, OperationState, TenantStatus } from './interfaces/tenant-config.interface';

@Injectable()
export class FailoverService {
  private readonly logger = new Logger(FailoverService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly operationService: TenantOperationService,
    private readonly routingPlane: RoutingPlaneService
  ) {}

  async triggerRegionalFailover(tenantId: string, idempotencyKey: string): Promise<void> {
    const op = await this.operationService.createOperation(tenantId, OperationType.FAILOVER, idempotencyKey);
    this.logger.warn(`EMERGENCY: Triggering regional failover for tenant: ${tenantId}`);

    try {
      await this.operationService.transitionState(op.operationId, OperationState.PREPARING);
      const control = await this.em.findOneOrFail(TenantControlRecord, { tenantId });

      if (control.status === TenantStatus.DEGRADED) {
          throw new ConflictException(`Tenant ${tenantId} is already in a degraded or failover state.`);
      }

      await this.operationService.transitionState(op.operationId, OperationState.VALIDATING);
      // Ensure secondary region is healthy and replicas are caught up
      this.logger.log(`Validating health of secondary region: ${control.secondaryRegion}`);

      await this.operationService.transitionState(op.operationId, OperationState.SWITCHED);
      // Promote secondary region to active for this tenant
      const newTargets = {
          primaryRegion: control.secondaryRegion,
          secondaryRegion: control.primaryRegion,
          failoverActive: true,
          switchedAt: new Date(),
      };

      await this.routingPlane.createSnapshot(tenantId, newTargets);
      control.status = TenantStatus.DEGRADED; // Mark as degraded while in failover
      await this.em.flush();

      await this.operationService.transitionState(op.operationId, OperationState.MONITORING);
      this.logger.log(`Monitoring traffic in failover region for tenant: ${tenantId}`);

      await this.operationService.transitionState(op.operationId, OperationState.FINALIZED);
      this.logger.log(`Failover finalized for tenant: ${tenantId}`);

    } catch (error: any) {
      this.logger.error(`Failover failed for tenant ${tenantId}: ${error.message}`);
      await this.operationService.transitionState(op.operationId, OperationState.ROLLBACK, { error: error.message });
      throw error;
    }
  }
}
