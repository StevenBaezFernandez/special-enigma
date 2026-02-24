import {
  EventSubscriber,
  FlushEventArgs,
  ChangeSetType,
} from '@mikro-orm/core';
import { DataAuditLog } from '../entities/data-audit-log.entity';
import { getTenantContext } from '@virteex/kernel-auth';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DataAuditSubscriber implements EventSubscriber {
  private readonly logger = new Logger(DataAuditSubscriber.name);

  async onFlush(args: FlushEventArgs): Promise<void> {
    const changeSets = args.uow.getChangeSets();
    const logs: DataAuditLog[] = [];

    for (const changeSet of changeSets) {
      if (changeSet.entity instanceof DataAuditLog) {
        continue;
      }

      const entityName = changeSet.entity.constructor.name;
      // Skip infrastructure entities
      if (['OutboxEvent', 'InboxMessage'].includes(entityName)) {
        continue;
      }

      const operation = this.mapOperation(changeSet.type);
      if (!operation) continue;

      const context = getTenantContext();
      const userId = context?.userId;
      const tenantId = context?.tenantId;

      const payload = changeSet.payload;

      // Attempt to get ID. Might be undefined for new entities with database-generated IDs.
      const entityId = (changeSet.entity as any).id;

      logs.push(new DataAuditLog(
        entityName,
        String(entityId || 'pending'),
        operation,
        payload,
        userId,
        tenantId
      ));
    }

    if (logs.length > 0) {
      // Persisting new entities inside onFlush triggers them to be included in the current transaction
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
}
