import {
  EventSubscriber,
  FlushEventArgs,
  ChangeSetType,
} from '@mikro-orm/core';
import { DataAuditLog } from '../entities/data-audit-log.entity';
import { getTenantContext } from '@virteex/kernel-tenant-context';
import { Injectable, Logger } from '@nestjs/common';
import { createHmac } from 'crypto';

@Injectable()
export class DataAuditSubscriber implements EventSubscriber {
  private readonly logger = new Logger(DataAuditSubscriber.name);
  private readonly PII_FIELDS = ['email', 'password', 'token', 'secret', 'card', 'phone', 'address', 'ssn'];

  async onFlush(args: FlushEventArgs): Promise<void> {
    const changeSets = args.uow.getChangeSets();
    const logs: DataAuditLog[] = [];

    // Level 5: Cryptographic Chaining - Fetch last hash once per flush if possible
    // In a real high-throughput scenario, we'd need a more complex sequencer.
    // Here we'll handle it per-tenant to maintain causal order.

    for (const changeSet of changeSets) {
      if (changeSet.entity instanceof DataAuditLog) {
        continue;
      }

      const entityName = changeSet.entity.constructor.name;
      if (['OutboxEvent', 'InboxMessage'].includes(entityName)) {
        continue;
      }

      const operation = this.mapOperation(changeSet.type);
      if (!operation) continue;

      const context = getTenantContext();
      const userId = context?.userId;
      const tenantId = context?.tenantId;

      const payload = this.deepCloneAndMask(changeSet.payload);
      const entityId = (changeSet.entity as any).id;

      const log = new DataAuditLog(
        entityName,
        String(entityId || 'pending'),
        operation,
        payload,
        userId,
        tenantId
      );

      // Level 5: Immutable Journal (Chained hashing)
      const secret = process.env['AUDIT_HMAC_SECRET'] || 'audit-secret-fail-safe';

      // Fetch previous hash for this tenant
      const lastEntry = await args.em.getConnection().execute(
          `SELECT hash FROM data_audit_log WHERE tenant_id = ? ORDER BY timestamp DESC, id DESC LIMIT 1`,
          [tenantId || 'system']
      );
      log.previousHash = lastEntry[0]?.hash || 'genesis-audit-chain';

      const content = `${log.timestamp.toISOString()}:${log.entityType}:${log.entityId}:${log.operation}:${JSON.stringify(log.changes)}:${log.userId || ''}:${log.tenantId || ''}:${log.previousHash}`;
      log.hash = createHmac('sha256', secret).update(content).digest('hex');

      logs.push(log);
    }

    if (logs.length > 0) {
      for (const log of logs) {
        args.em.persist(log);
      }
    }
  }

  private mapOperation(type: ChangeSetType): string | null {
    switch (type) {
      case ChangeSetType.CREATE: return 'INSERT';
      case ChangeSetType.UPDATE: return 'UPDATE';
      case ChangeSetType.DELETE: return 'DELETE';
      default: return null;
    }
  }

  private deepCloneAndMask(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepCloneAndMask(item));
    }

    const maskedObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const lowerKey = key.toLowerCase();
        if (this.PII_FIELDS.some(field => lowerKey.includes(field))) {
          maskedObj[key] = '[MASKED_FOR_COMPLIANCE]';
        } else {
          maskedObj[key] = this.deepCloneAndMask(obj[key]);
        }
      }
    }
    return maskedObj;
  }
}
