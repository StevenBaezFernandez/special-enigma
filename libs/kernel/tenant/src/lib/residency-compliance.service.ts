import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { createHash } from 'crypto';
import { TenantService } from './tenant.service';
import { buildCentralResidencyPolicy, isRegionAllowed, maskPiiPayload, ResidencyResource } from './residency-policy.util';

interface ReplicationAuthorizationInput {
  tenantId: string;
  sourceRegion: string;
  targetRegion: string;
  resource: ResidencyResource;
  actorId: string;
  actorRoles: string[];
  payload?: unknown;
  reason: string;
}

@Injectable()
export class ResidencyComplianceService {
  private readonly logger = new Logger(ResidencyComplianceService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly tenantService: TenantService
  ) {}

  async getPolicy(tenantId: string) {
    const config = await this.tenantService.getTenantConfig(tenantId);
    return buildCentralResidencyPolicy(tenantId, config);
  }

  async assertRegionAllowed(tenantId: string, region: string, resource: ResidencyResource, channel: 'sync' | 'async'): Promise<void> {
    const policy = await this.getPolicy(tenantId);
    if (!isRegionAllowed(policy, resource, region)) {
      await this.writeAudit(tenantId, 'RESIDENCY_POLICY_VIOLATION', 'CRITICAL', {
        channel,
        resource,
        expectedRegions: policy.resources[resource],
        actualRegion: region,
      });
      throw new ForbiddenException(`Data residency policy violation in ${channel} channel. Access denied for region: ${region}`);
    }
  }

  async authorizeReplication(input: ReplicationAuthorizationInput) {
    const policy = await this.getPolicy(input.tenantId);

    const targetAllowed = policy.replication.allowedTargets.includes(input.targetRegion);
    const roleAllowed = input.actorRoles.some((role) => policy.replication.requiredRoles.includes(role));

    if (!targetAllowed || !roleAllowed) {
      await this.writeAudit(input.tenantId, 'REPLICATION_AUTHZ_DENIED', 'HIGH', {
        sourceRegion: input.sourceRegion,
        targetRegion: input.targetRegion,
        resource: input.resource,
        actorId: input.actorId,
        actorRoles: input.actorRoles,
        requiredRoles: policy.replication.requiredRoles,
        reason: input.reason,
      });
      throw new ForbiddenException('Cross-region replication denied by central residency policy');
    }

    const replicatedPayload = policy.replication.masking.enabled
      ? maskPiiPayload(input.payload, policy.replication.masking.piiFields)
      : input.payload;

    const evidenceId = createHash('sha256')
      .update(
        JSON.stringify({
          tenantId: input.tenantId,
          sourceRegion: input.sourceRegion,
          targetRegion: input.targetRegion,
          payload: replicatedPayload,
          at: new Date().toISOString(),
        })
      )
      .digest('hex');

    if (policy.replication.requireAudit) {
      await this.writeAudit(input.tenantId, 'REPLICATION_AUTHZ_GRANTED', 'INFO', {
        sourceRegion: input.sourceRegion,
        targetRegion: input.targetRegion,
        resource: input.resource,
        actorId: input.actorId,
        reason: input.reason,
        maskingApplied: policy.replication.masking.enabled,
        evidenceId,
        replicatedPayload,
      });
    }

    return {
      authorized: true,
      evidenceId,
      replicatedPayload,
      maskingApplied: policy.replication.masking.enabled,
    };
  }

  async getAuditorEvents(filters: { tenantId?: string; region?: string; limit?: number }) {
    const limit = Math.min(filters.limit || 50, 500);
    const rows = await this.em.getConnection().execute(
      `SELECT tenant_id, event_type, severity, payload, created_at
       FROM security_audit_journal
       WHERE (? IS NULL OR tenant_id = ?)
         AND (? IS NULL OR payload::text ILIKE ?)
         AND event_type IN ('REPLICATION_AUTHZ_GRANTED', 'REPLICATION_AUTHZ_DENIED', 'RESIDENCY_POLICY_VIOLATION')
       ORDER BY created_at DESC
       LIMIT ?`,
      [
        filters.tenantId ?? null,
        filters.tenantId ?? null,
        filters.region ?? null,
        filters.region ? `%${filters.region}%` : null,
        limit,
      ]
    );

    return rows;
  }

  async getComplianceDashboard(filters: { tenantId?: string; region?: string }) {
    const events = await this.getAuditorEvents({ ...filters, limit: 500 });
    const totals = {
      authorizedReplications: 0,
      deniedReplications: 0,
      residencyViolations: 0,
    };

    for (const event of events) {
      if (event.event_type === 'REPLICATION_AUTHZ_GRANTED') totals.authorizedReplications += 1;
      if (event.event_type === 'REPLICATION_AUTHZ_DENIED') totals.deniedReplications += 1;
      if (event.event_type === 'RESIDENCY_POLICY_VIOLATION') totals.residencyViolations += 1;
    }

    const totalDecisions = totals.authorizedReplications + totals.deniedReplications;
    const authorizationRate = totalDecisions > 0 ? totals.authorizedReplications / totalDecisions : 1;

    return {
      filters,
      totals,
      authorizationRate,
      generatedAt: new Date().toISOString(),
    };
  }

  private async writeAudit(tenantId: string, eventType: string, severity: string, payload: unknown) {
    try {
      await this.em.getConnection().execute(
        `INSERT INTO security_audit_journal (tenant_id, event_type, severity, payload, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [tenantId, eventType, severity, JSON.stringify(payload), new Date()]
      );
    } catch (error) {
      this.logger.error(`Failed to write audit event ${eventType} for tenant ${tenantId}`, error as Error);
      throw error;
    }
  }
}
