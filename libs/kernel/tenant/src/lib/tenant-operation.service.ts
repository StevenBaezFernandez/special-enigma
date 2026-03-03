import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TenantOperation } from './entities/tenant-operation.entity';
import { OperationState, OperationType } from './interfaces/tenant-config.interface';

@Injectable()
export class TenantOperationService {
  private readonly logger = new Logger(TenantOperationService.name);

  constructor(private readonly em: EntityManager) {}

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
    return op;
  }

  private isInvalidTransition(current: OperationState, next: OperationState): boolean {
    const allowed: Record<OperationState, OperationState[]> = {
      [OperationState.REQUESTED]: [OperationState.PREPARING, OperationState.ROLLBACK],
      [OperationState.PREPARING]: [OperationState.VALIDATING, OperationState.ROLLBACK],
      [OperationState.VALIDATING]: [OperationState.SWITCHED, OperationState.ROLLBACK],
      [OperationState.SWITCHED]: [OperationState.MONITORING, OperationState.ROLLBACK],
      [OperationState.MONITORING]: [OperationState.FINALIZED, OperationState.ROLLBACK],
      [OperationState.FINALIZED]: [],
      [OperationState.ROLLBACK]: [OperationState.FINALIZED], // Allow finishing rollback
    };

    return !allowed[current].includes(next);
  }
}
