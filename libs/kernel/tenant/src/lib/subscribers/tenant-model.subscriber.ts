import { EventSubscriber, EventArgs } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';
import { getTenantContext } from '@virteex/kernel-auth';

@Injectable()
export class TenantModelSubscriber implements EventSubscriber {
  private readonly logger = new Logger(TenantModelSubscriber.name);

  async beforeCreate(args: EventArgs<any>): Promise<void> {
    // Check if the entity is multi-tenant aware (has 'tenantId' property)
    if ('tenantId' in args.entity) {
      const context = getTenantContext();

      if (!context || !context.tenantId) {
        // FAIL CLOSED: If we try to persist a tenant-scoped entity without context, BLOCK IT.
        const errorMsg = `Security Violation: Attempted to persist tenant-scoped entity '${args.entity.constructor.name}' without a valid tenant context.`;
        this.logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      // Enforce the tenant from context
      args.entity.tenantId = context.tenantId;
    }
  }
}
