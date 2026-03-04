import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TenantRoutingSnapshot } from './entities/tenant-routing-snapshot.entity';
import { TenantService } from './tenant.service';
import { createHmac, timingSafeEqual } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { TenantControlRecord } from './entities/tenant-control-record.entity';

/**
 * Enterprise Routing Policy Engine
 *
 * Objectives:
 * 1. Health-aware routing
 * 2. Residency enforcement
 * 3. Anti-tamper snapshots
 * 4. Explicit failover state management
 */
@Injectable()
export class RoutingPlaneService {
  private readonly logger = new Logger(RoutingPlaneService.name);
  private readonly hmacSecret: string;

  constructor(
    private readonly em: EntityManager,
    private readonly tenantService: TenantService,
    private readonly configService: ConfigService
  ) {
    const secret = this.configService.get<string>('ROUTING_SNAPSHOT_SECRET');
    const isProduction = process.env['NODE_ENV'] === 'production';

    if (isProduction && (!secret || secret === 'dev-secret-change-in-prod')) {
        this.logger.error('[SECURITY CRITICAL] Insecure ROUTING_SNAPSHOT_SECRET in production');
        throw new Error('Insecure routing configuration');
    }
    this.hmacSecret = secret || 'dev-secret-change-in-prod';
  }

  async resolveRoute(tenantId: string): Promise<any> {
    const snapshot = await this.em.findOne(TenantRoutingSnapshot, { tenantId });

    if (snapshot) {
      if (!this.verifySnapshot(snapshot)) {
        this.logger.error(`[SECURITY] Tampered routing snapshot detected for tenant ${tenantId}`);
        throw new ForbiddenException('Routing snapshot integrity violation');
      }

      if (this.isExpired(snapshot)) {
          this.logger.warn(`Routing snapshot for ${tenantId} EXPIRED. Re-evaluating policies.`);
      } else {
          return snapshot.routeTargets;
      }
    }

    return this.evaluateRoutingPolicies(tenantId);
  }

  private async evaluateRoutingPolicies(tenantId: string): Promise<any> {
    this.logger.log(`Evaluating industrial routing policies for tenant ${tenantId}`);

    const config = await this.tenantService.getTenantConfig(tenantId);
    const control = await this.em.findOne(TenantControlRecord, { tenantId });

    if (!control) {
        throw new Error(`Tenant ${tenantId} has no control record. Routing impossible.`);
    }

    // Policy 1: Data Sovereignty / Residency Enforcement
    const allowedRegion = config.settings?.['allowedRegion'] || control.primaryRegion;

    // Policy 2: Failover Awareness
    const primary = control.status === 'DEGRADED' ? control.secondaryRegion : control.primaryRegion;
    const secondary = control.status === 'DEGRADED' ? control.primaryRegion : control.secondaryRegion;

    // Policy 3: Connectivity & Capacity (Simulated for this implementation)
    const endpoint = config.connectionString || 'shared-pool-discovery';

    const targets = {
      tenantId,
      mode: config.mode,
      primaryRegion: primary,
      secondaryRegion: secondary,
      allowedRegion,
      endpoint,
      failoverActive: control.status === 'DEGRADED',
      status: control.status,
      version: control.version,
      updatedAt: new Date().toISOString(),
      policyEngine: 'v5.0-industrial'
    };

    await this.createSnapshot(tenantId, targets);
    return targets;
  }

  async createSnapshot(tenantId: string, targets: any): Promise<TenantRoutingSnapshot> {
    const existing = await this.em.findOne(TenantRoutingSnapshot, { tenantId });
    const generation = existing ? existing.generation + 1 : 1;

    // Snapshot Expiration Logic: 24h for high security, 7d for stability
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const snapshotData = {
      tenantId,
      generation,
      routeTargets: { ...targets, expiresAt: expiresAt.toISOString() },
      issuedAt: new Date(),
    };

    const signature = this.calculateSignature(snapshotData);

    let snapshot: TenantRoutingSnapshot;
    if (existing) {
        this.em.assign(existing, { ...snapshotData, signature });
        snapshot = existing;
    } else {
        snapshot = this.em.create(TenantRoutingSnapshot, { ...snapshotData, signature });
        this.em.persist(snapshot);
    }

    await this.em.flush();
    this.logger.log(`Signed routing snapshot PERSISTED for ${tenantId} (Gen ${generation}).`);
    return snapshot;
  }

  private calculateSignature(data: any): string {
    const payload = JSON.stringify({
      tenantId: data.tenantId,
      generation: data.generation,
      routeTargets: data.routeTargets,
      issuedAt: data.issuedAt instanceof Date ? data.issuedAt.toISOString() : data.issuedAt,
    });

    return createHmac('sha256', this.hmacSecret).update(payload).digest('hex');
  }

  private verifySnapshot(snapshot: TenantRoutingSnapshot): boolean {
    const expected = this.calculateSignature(snapshot);
    const signatureBuffer = Buffer.from(snapshot.signature);
    const expectedBuffer = Buffer.from(expected);

    if (signatureBuffer.length !== expectedBuffer.length) return false;
    return timingSafeEqual(signatureBuffer, expectedBuffer);
  }

  private isExpired(snapshot: TenantRoutingSnapshot): boolean {
      const expiresAt = snapshot.routeTargets?.expiresAt;
      if (!expiresAt) return true;
      return new Date(expiresAt) < new Date();
  }
}
