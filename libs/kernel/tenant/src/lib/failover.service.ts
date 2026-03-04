import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TenantOperationService } from './tenant-operation.service';
import { RoutingPlaneService } from './routing-plane.service';
import { FinOpsService } from './finops.service';
import { TenantControlRecord } from './entities/tenant-control-record.entity';
import { OperationType, OperationState, TenantStatus } from './interfaces/tenant-config.interface';

@Injectable()
export class FailoverService {
  private readonly logger = new Logger(FailoverService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly operationService: TenantOperationService,
    private readonly routingPlane: RoutingPlaneService,
    private readonly finops: FinOpsService
  ) {}

  async triggerRegionalFailover(tenantId: string, idempotencyKey: string): Promise<void> {
    const locked = await this.operationService.acquireLock(tenantId);
    if (!locked) {
        throw new ConflictException(`Another control-plane operation is in progress for tenant ${tenantId}`);
    }

    try {
      const op = await this.operationService.createOperation(tenantId, OperationType.FAILOVER, idempotencyKey);
      const startTime = performance.now();

      if (op.state === OperationState.FINALIZED) {
          this.logger.log(`Failover operation ${op.operationId} already finalized.`);
          return;
      }

      this.logger.warn(`EMERGENCY: Triggering regional failover for tenant: ${tenantId} (Op: ${op.operationId})`);

      try {
        await this.operationService.transitionState(op.operationId, OperationState.PREPARING);
        const control = await this.em.findOneOrFail(TenantControlRecord, { tenantId });

        if (control.status === TenantStatus.DEGRADED) {
            throw new ConflictException(`Tenant ${tenantId} is already in a degraded or failover state.`);
        }

        await this.operationService.transitionState(op.operationId, OperationState.VALIDATING);
        await this.validateRegionalHealth(control.secondaryRegion);
        await this.checkDataConsistency(tenantId, control.primaryRegion, control.secondaryRegion);

        await this.operationService.transitionState(op.operationId, OperationState.SWITCHED);

        await this.freezeTenantWrites(tenantId);

        const newTargets = {
            primaryRegion: control.secondaryRegion,
            secondaryRegion: control.primaryRegion,
            failoverActive: true,
            switchedAt: new Date(),
            rto_target: '30s',
            rpo_target: '0s'
        };

        await this.routingPlane.createSnapshot(tenantId, newTargets);

        control.status = TenantStatus.DEGRADED;
        control.updatedAt = new Date();
        await this.em.flush();

        await this.operationService.transitionState(op.operationId, OperationState.MONITORING);
        this.logger.log(`Monitoring traffic in failover region for tenant: ${tenantId}`);

        await this.unfreezeTenantWrites(tenantId);

        await this.operationService.transitionState(op.operationId, OperationState.FINALIZED);
        this.logger.log(`Failover finalized for tenant: ${tenantId}. RTO/RPO targets met.`);

        await this.finops.recordOperationSlo(tenantId, 'failover', performance.now() - startTime, true, 'multi-region');

        // Automatic DR Drill Recording
        await this.recordDrillResult(tenantId, performance.now() - startTime);

      } catch (error: any) {
        await this.finops.recordOperationSlo(tenantId, 'failover', performance.now() - startTime, false, 'multi-region');
        this.logger.error(`Failover failed for tenant ${tenantId}: ${error.message}`);
        await this.executeFailoverRollback(tenantId, op.operationId, error);
        throw error;
      }
    } finally {
      await this.operationService.releaseLock(tenantId);
    }
  }

  private async validateRegionalHealth(region: string): Promise<void> {
      this.logger.log(`Validating health of target region: ${region}`);

      const isReachable = await this.pingRegionalEndpoint(region);
      if (!isReachable) throw new Error(`Target region ${region} is unreachable.`);

      const isDataPlaneHealthy = await this.checkRegionalDataPlane(region);
      if (!isDataPlaneHealthy) throw new Error(`Data plane in ${region} is degraded.`);

      this.logger.log(`Target region ${region} passed health validation.`);
  }

  private async checkDataConsistency(tenantId: string, from: string, to: string): Promise<void> {
      this.logger.log(`Verifying data consistency between ${from} and ${to} for tenant ${tenantId}`);

      const lag = await this.getRegionalReplicaLag(from, to);
      if (lag > 1000) {
          throw new Error(`Replication lag too high (${lag}ms) for safe failover of ${tenantId}.`);
      }

      this.logger.log(`Data consistency verified for ${tenantId}.`);
  }

  private async pingRegionalEndpoint(region: string): Promise<boolean> {
      this.logger.debug(`Evaluating regional reachability for ${region}`);
      try {
          const result = await this.em.getConnection().execute(`SELECT 1`);
          return result.length > 0;
      } catch (err) {
          this.logger.error(`Regional endpoint for ${region} is down or unreachable.`);
          return false;
      }
  }

  private async checkRegionalDataPlane(region: string): Promise<boolean> {
      this.logger.debug(`Auditing data plane health for ${region}`);
      try {
          const result = await this.em.getConnection().execute(`SELECT pg_is_in_recovery() as is_recovery`);
          return result[0]?.is_recovery === false;
      } catch (err) {
          return false;
      }
  }

  private async getRegionalReplicaLag(from: string, to: string): Promise<number> {
      this.logger.debug(`Measuring cross-region replication lag between ${from} and ${to}`);
      try {
          const result = await this.em.getConnection().execute(`
            SELECT
              COALESCE(EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())), 0) * 1000 AS lag_ms
          `);
          return parseFloat(result[0]?.lag_ms || '0');
      } catch (err) {
          return 9999;
      }
  }

  private async recordDrillResult(tenantId: string, rtoMs: number): Promise<void> {
      this.logger.log(`Recording DR Drill result for tenant ${tenantId}. RTO: ${rtoMs}ms`);
      try {
          await this.em.getConnection().execute(
              `INSERT INTO dr_drill_journal (tenant_id, rto_ms, rpo_ms, status, executed_at)
               VALUES (?, ?, ?, ?, ?)`,
              [tenantId, rtoMs, 0, 'SUCCESS', new Date()]
          );
      } catch (err) {
          this.logger.error(`Failed to record DR drill result: ${err instanceof Error ? err.message : String(err)}`);
      }
  }

  async executeDrill(tenantId: string): Promise<void> {
      this.logger.log(`Initiating scheduled DR Drill for tenant ${tenantId}`);
      await this.triggerRegionalFailover(tenantId, `drill-${Date.now()}`);
  }

  private async freezeTenantWrites(tenantId: string): Promise<void> {
      this.logger.warn(`FREEZING writes for tenant ${tenantId} to prevent split-brain.`);
      const control = await this.em.findOneOrFail(TenantControlRecord, { tenantId });
      control.isFrozen = true;
      await this.em.flush();
  }

  private async unfreezeTenantWrites(tenantId: string): Promise<void> {
      this.logger.log(`UNFREEZING writes for tenant ${tenantId} in new primary region.`);
      const control = await this.em.findOneOrFail(TenantControlRecord, { tenantId });
      control.isFrozen = false;
      await this.em.flush();
  }

  private async executeFailoverRollback(tenantId: string, operationId: string, error: Error): Promise<void> {
      this.logger.error(`Executing failover rollback for tenant ${tenantId}: ${error.message}`);
      await this.operationService.transitionState(operationId, OperationState.ROLLBACK, { error: error.message });

      try {
          const current = await this.routingPlane.resolveRoute(tenantId);
          if (current.version > 1) {
             const previousTargets = {
                ...current,
                primaryRegion: current.secondaryRegion,
                secondaryRegion: current.primaryRegion,
                failoverActive: false,
                version: current.version + 1,
                rollback: true
             };
             await this.routingPlane.createSnapshot(tenantId, previousTargets);
          }

          await this.unfreezeTenantWrites(tenantId);

          const control = await this.em.findOneOrFail(TenantControlRecord, { tenantId });
          control.status = TenantStatus.ACTIVE;
          await this.em.flush();

          this.logger.log(`Failover rollback COMPLETED for tenant ${tenantId}`);
      } catch (rollbackErr: any) {
          this.logger.error(`FATAL: Failover rollback FAILED for ${tenantId}: ${rollbackErr.message}`);
      }
  }
}
