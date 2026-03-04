import { Injectable, Logger, ConflictException, OnModuleInit } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TenantOperation } from './entities/tenant-operation.entity';
import { OperationState, OperationType } from './interfaces/tenant-config.interface';
import Redis from 'ioredis';

@Injectable()
export class TenantOperationService implements OnModuleInit {
  private readonly logger = new Logger(TenantOperationService.name);
  private redis: Redis | null = null;

  constructor(private readonly em: EntityManager) {}

  onModuleInit() {
    if (process.env['REDIS_URL']) {
        this.redis = new Redis(process.env['REDIS_URL']);
    }
  }

  async acquireLock(tenantId: string, ttl = 30000): Promise<boolean> {
      if (!this.redis) {
          const isProduction = process.env['NODE_ENV'] === 'production';
          if (isProduction) {
              this.logger.error('[SECURITY CRITICAL] Distributed lock attempted without Redis in production. Fail-closed.');
              return false;
          }
          return true; // Safe fallback for local/test
      }
      const key = `lock:tenant:ops:${tenantId}`;
      const result = await this.redis.set(key, 'locked', 'PX', ttl, 'NX');
      return result === 'OK';
  }

  async releaseLock(tenantId: string): Promise<void> {
      if (!this.redis) return;
      await this.redis.del(`lock:tenant:ops:${tenantId}`);
  }

  async createOperation(
    tenantId: string,
    type: OperationType,
    idempotencyKey: string
  ): Promise<TenantOperation> {
    const existing = await this.em.findOne(TenantOperation, { idempotencyKey });
    if (existing) {
      this.logger.log(`Operation already exists for idempotencyKey: ${idempotencyKey}`);
      return existing;
    }

    const op = this.em.create(TenantOperation, {
      tenantId,
      type,
      state: OperationState.REQUESTED,
      idempotencyKey,
      startedAt: new Date(),
    } as any);

    await this.em.persistAndFlush(op);
    return op;
  }

  async transitionState(
    operationId: string,
    newState: OperationState,
    result?: any,
    evidenceUri?: string
  ): Promise<TenantOperation> {
    const op = await this.em.findOneOrFail(TenantOperation, { operationId });

    if (this.isInvalidTransition(op.state, newState)) {
      throw new ConflictException(`Invalid state transition from ${op.state} to ${newState}`);
    }

    op.state = newState;
    if (result) op.result = { ...op.result, ...result };
    if (evidenceUri) op.evidenceUri = evidenceUri;

    if (newState === OperationState.FINALIZED || newState === OperationState.ROLLBACK) {
      op.finishedAt = new Date();
    }

    await this.em.flush();
    this.logger.log(`Operation ${operationId} transitioned to ${newState}`);

    // Level 5: Append to Immutable Operation Journal
    await this.appendToJournal(op, newState, result);

    return op;
  }

  private async appendToJournal(op: TenantOperation, state: OperationState, payload?: any): Promise<void> {
    try {
        // Level 5: Transactional Journaling to Immutable Audit Trail
        this.logger.log(`[JOURNAL] Tenant=${op.tenantId}, Op=${op.type}, State=${state}, Key=${op.idempotencyKey}`);

        await this.em.getConnection().execute(
            `INSERT INTO tenant_operation_journal (tenant_id, operation_id, type, state, payload, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [op.tenantId, op.operationId, op.type, state, JSON.stringify(payload || {}), new Date()]
        );
    } catch (err) {
        // Do not fail the operation if journaling fails, but log a CRITICAL error
        this.logger.error(`[CRITICAL] Failed to append to immutable journal: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  private isInvalidTransition(current: OperationState, next: OperationState): boolean {
    const allowed: Record<OperationState, OperationState[]> = {
      [OperationState.REQUESTED]: [OperationState.PREPARING, OperationState.ROLLBACK],
      [OperationState.PREPARING]: [OperationState.VALIDATING, OperationState.ROLLBACK],
      [OperationState.VALIDATING]: [OperationState.DRY_RUN, OperationState.ROLLBACK],
      [OperationState.DRY_RUN]: [OperationState.SWITCHING, OperationState.ROLLBACK],
      [OperationState.SWITCHING]: [OperationState.SWITCHED, OperationState.ROLLBACK],
      [OperationState.SWITCHED]: [OperationState.MONITORING, OperationState.ROLLBACK],
      [OperationState.MONITORING]: [OperationState.RECONCILING, OperationState.ROLLBACK],
      [OperationState.RECONCILING]: [OperationState.FINALIZED, OperationState.ROLLBACK],
      [OperationState.FINALIZED]: [],
      [OperationState.ROLLBACK]: [OperationState.FINALIZED], // Allow finishing rollback
    };

    return !allowed[current]?.includes(next) ?? true;
  }
}
