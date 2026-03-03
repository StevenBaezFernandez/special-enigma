import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import * as crypto from 'crypto';
import { AuditLedger } from './entities/audit-ledger.entity';

@Injectable()
export class AuditLedgerService {
  private readonly logger = new Logger(AuditLedgerService.name);

  constructor(private readonly em: EntityManager) {}

  /**
   * Level 5: Immutable Audit Ledger with Hash-Chaining.
   * Uses MikroORM for type safety and database portability.
   */
  async logSensitiveOperation(
    tenantId: string,
    userId: string,
    action: string,
    details: any
  ): Promise<void> {
    await this.em.transactional(async (txEm) => {
      const lastEntry = await txEm.findOne(AuditLedger, {}, {
        orderBy: { createdAt: 'DESC' },
        lockMode: 2 // Pessimistic write
      });

      const previousHash = lastEntry?.hash || 'GENESIS';
      const timestamp = new Date();
      const dataToHash = `${previousHash}|${tenantId}|${userId}|${action}|${JSON.stringify(details)}|${timestamp.toISOString()}`;
      const currentHash = crypto.createHash('sha256').update(dataToHash).digest('hex');

      const entry = new AuditLedger();
      entry.tenantId = tenantId;
      entry.userId = userId;
      entry.action = action;
      entry.details = details;
      entry.previousHash = previousHash;
      entry.hash = currentHash;
      entry.createdAt = timestamp;

      txEm.persist(entry);
    });

    this.logger.log(`Sensitive operation [${action}] audited for tenant ${tenantId}.`);
  }
}
