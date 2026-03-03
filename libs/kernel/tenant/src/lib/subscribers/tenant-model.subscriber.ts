import { EventSubscriber, EventArgs } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';
import { getTenantContext } from '@virteex/kernel-auth';
import { TenantControlRecord } from '../entities/tenant-control-record.entity';

@Injectable()
export class TenantModelSubscriber implements EventSubscriber {
  private readonly logger = new Logger(TenantModelSubscriber.name);

  async beforeCreate(args: EventArgs<any>): Promise<void> {
    await this.enforceTenantSecurity(args, 'create');
  }

  async beforeUpdate(args: EventArgs<any>): Promise<void> {
    await this.enforceTenantSecurity(args, 'update');
  }

  async beforeDelete(args: EventArgs<any>): Promise<void> {
    await this.enforceTenantSecurity(args, 'delete');
  }

  private async enforceTenantSecurity(args: EventArgs<any>, operation: string): Promise<void> {
    // 1. Check if the entity is multi-tenant aware
    if (!('tenantId' in args.entity)) {
        return;
    }

    const context = getTenantContext();

    // 2. Fail-closed: No context = No write
    if (!context || !context.tenantId) {
        const errorMsg = `[SECURITY VIOLATION] Attempted to ${operation} tenant-scoped entity '${args.entity.constructor.name}' without a valid tenant context.`;
        this.logger.error(errorMsg);
        throw new Error(errorMsg);
    }

    const tenantId = context.tenantId;

    // 3. Bypass for Control Plane operations (Strict Allowlist)
    if (this.isControlPlaneOperation(args)) {
        this.logger.log(`Control Plane operation allowed for tenant ${tenantId}`);
        return;
    }

    // 4. Persistence-level "isFrozen" Enforcement (Second layer of defense)
    await this.checkWriteFreeze(args, tenantId, operation);

    // 5. Enforce tenant isolation (prevent tenant-escape on writes)
    if (operation === 'create') {
        args.entity.tenantId = tenantId;
    } else if (args.entity.tenantId !== tenantId) {
        this.logger.error(`[AUDIT] CROSS-TENANT WRITE ATTEMPT: Tenant ${tenantId} tried to ${operation} entity belonging to ${args.entity.tenantId}`);
        throw new Error('Cross-tenant write operation blocked.');
    }
  }

  private isControlPlaneOperation(args: EventArgs<any>): boolean {
    const controlPlaneEntities = ['TenantControlRecord', 'TenantOperation', 'TenantRoutingSnapshot'];
    return controlPlaneEntities.includes(args.entity.constructor.name);
  }

  private async checkWriteFreeze(args: EventArgs<any>, tenantId: string, operation: string): Promise<void> {
    // We query the control record directly to ensure we have the latest truth
    // Use the EM from EventArgs to participate in the same transaction if applicable
    // We use findOne with filters: false to ensure we can read the control record regardless of RLS
    const control = await args.em.findOne(TenantControlRecord, { tenantId }, { filters: false });

    if (control?.isFrozen) {
        this.logger.error(`[SECURITY] Write persistence blocked for frozen tenant ${tenantId} during ${operation}`);
        this.logger.warn(`AUDIT: PERSISTENCE Region/Maintenance Freeze Violation: Tenant=${tenantId}, Op=${operation}, Entity=${args.entity.constructor.name}`);
        throw new Error(`Tenant ${tenantId} is currently frozen. Persistent writes are disabled.`);
    }
  }
}
