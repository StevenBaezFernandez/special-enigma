import {
  Injectable,
  Logger,
  ConflictException,
  OnModuleInit,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TenantOperation } from './entities/tenant-operation.entity';
import {
  OperationState,
  OperationType,
} from './interfaces/tenant-config.interface';
import Redis from 'ioredis';
import { createHmac } from 'crypto';
import { TelemetryService } from '@virteex/kernel-telemetry-interfaces';

@Injectable()
export class TenantOperationService implements OnModuleInit {
  private readonly logger = new Logger(TenantOperationService.name);
  private redis: Redis | null = null;
  private readonly strictJournalOps = new Set<OperationType>([
    OperationType.MIGRATE,
    OperationType.FAILOVER,
  ]);

  constructor(
    private readonly em: EntityManager,
    private readonly telemetry: TelemetryService,
  ) {}

  onModuleInit() {
    if (process.env['REDIS_URL']) {
      this.redis = new Redis(process.env['REDIS_URL'], {
        lazyConnect: true,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
      });
      this.redis.on('error', (err) => {
        this.logger.warn(
          `Redis unavailable for tenant operation locks: ${(err as Error).message}`,
        );
      });
      void this.redis.connect().catch((err) => {
        this.logger.warn(
          `Redis lock backend startup failed. Falling back by environment policy: ${(err as Error).message}`,
        );
      });
    }
  }

  async acquireLock(tenantId: string, ttl = 30000): Promise<boolean> {
    if (!this.redis) {
      const isProduction = process.env['NODE_ENV'] === 'production';
      if (isProduction) {
        this.logger.error(
          '[SECURITY CRITICAL] Distributed lock attempted without Redis in production. Fail-closed.',
        );
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
    idempotencyKey: string,
  ): Promise<TenantOperation> {
    const existing = await this.em.findOne(TenantOperation, { idempotencyKey });
    if (existing) {
      this.logger.log(
        `Operation already exists for idempotencyKey: ${idempotencyKey}`,
      );
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
    this.telemetry.recordSecurityEvent('CONTROL_PLANE_OPERATION_CREATED', {
      tenantId,
      operationId: op.operationId,
      operationType: type,
      idempotencyKey,
      timestamp: new Date().toISOString(),
    });
    return op;
  }

  async transitionState(
    operationId: string,
    newState: OperationState,
    result?: unknown,
    evidenceUri?: string,
  ): Promise<TenantOperation> {
    const op = await this.em.findOneOrFail(TenantOperation, { operationId });

    if (this.isInvalidTransition(op.state, newState)) {
      throw new ConflictException(
        `Invalid state transition from ${op.state} to ${newState}`,
      );
    }

    op.state = newState;
    if (result) op.result = { ...op.result, ...(result as any) };
    if (evidenceUri) op.evidenceUri = evidenceUri;

    if (
      newState === OperationState.FINALIZED ||
      newState === OperationState.ROLLBACK
    ) {
      op.finishedAt = new Date();
    }

    await this.em.flush();
    this.logger.log(`Operation ${operationId} transitioned to ${newState}`);

    // Level 5: Append to Immutable Operation Journal
    await this.appendToJournal(op, newState, result as any);
    this.telemetry.recordSecurityEvent('CONTROL_PLANE_OPERATION_TRANSITION', {
      tenantId: op.tenantId,
      operationId: op.operationId,
      operationType: op.type,
      state: newState,
      timestamp: new Date().toISOString(),
    });

    return op;
  }

  private async appendToJournal(
    op: TenantOperation,
    state: OperationState,
    payload?: unknown,
  ): Promise<void> {
    const secret = process.env['AUDIT_HMAC_SECRET'];
    if (!secret) {
      const message =
        'AUDIT_HMAC_SECRET is required for immutable operation journal.';
      this.logger.error(`[CRITICAL] ${message}`);
      if (this.strictJournalOps.has(op.type as OperationType)) {
        throw new Error(message);
      }
      return;
    }

    try {
      // Level 5: Transactional Journaling to Immutable Audit Trail with Chained Hashing
      this.logger.log(
        `[JOURNAL] Tenant=${op.tenantId}, Op=${op.type}, State=${state}, Key=${op.idempotencyKey}`,
      );

      const timestamp = new Date();

      // Fetch last hash for this tenant to create a chain
      const lastEntry = await this.em
        .getConnection()
        .execute(
          `SELECT chain_hash FROM tenant_operation_journal WHERE tenant_id = ? ORDER BY id DESC LIMIT 1`,
          [op.tenantId],
        );
      const lastHash =
        lastEntry[0]?.chain_hash || 'genesis-standard-enterprise-5-5';

      const content = `${op.tenantId}:${op.operationId}:${op.type}:${state}:${JSON.stringify(payload || {})}:${timestamp.toISOString()}:${lastHash}`;
      const chainHash = createHmac('sha256', secret)
        .update(content)
        .digest('hex');

      await this.em.getConnection().execute(
        `INSERT INTO tenant_operation_journal (tenant_id, operation_id, type, state, payload, created_at, chain_hash)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          op.tenantId,
          op.operationId,
          op.type,
          state,
          JSON.stringify(payload || {}),
          timestamp,
          chainHash,
        ],
      );
    } catch (err) {
      const message = `[CRITICAL] Failed to append to immutable journal: ${err instanceof Error ? err.message : String(err)}`;
      this.logger.error(message);
      if (this.strictJournalOps.has(op.type as OperationType)) {
        throw new Error(message);
      }
    }
  }

  private isInvalidTransition(
    current: OperationState,
    next: OperationState,
  ): boolean {
    const allowed: Record<string, OperationState[]> = {
      [OperationState.REQUESTED]: [
        OperationState.PREPARING,
        OperationState.ROLLBACK,
      ],
      [OperationState.PREPARING]: [
        OperationState.VALIDATING,
        OperationState.ROLLBACK,
      ],
      [OperationState.VALIDATING]: [
        OperationState.DRY_RUN,
        OperationState.ROLLBACK,
        OperationState.SWITCHING,
      ], // Allow switching after validating for failover
      [OperationState.DRY_RUN]: [
        OperationState.SWITCHING,
        OperationState.ROLLBACK,
      ],
      [OperationState.SWITCHING]: [
        OperationState.SWITCHED,
        OperationState.ROLLBACK,
      ],
      [OperationState.SWITCHED]: [
        OperationState.MONITORING,
        OperationState.ROLLBACK,
        OperationState.FINALIZED,
      ], // Switched can be final
      [OperationState.MONITORING]: [
        OperationState.RECONCILING,
        OperationState.ROLLBACK,
      ],
      [OperationState.RECONCILING]: [
        OperationState.FINALIZED,
        OperationState.ROLLBACK,
      ],
      [OperationState.FINALIZED]: [],
      [OperationState.ROLLBACK]: [OperationState.FINALIZED], // Allow finishing rollback
    };

    const allowedNext = allowed[current];
    if (!allowedNext) return true;
    return !allowedNext.includes(next);
  }
}
