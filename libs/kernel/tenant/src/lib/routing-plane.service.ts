import {
  Injectable,
  Logger,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TenantRoutingSnapshot } from './entities/tenant-routing-snapshot.entity';
import { TenantService } from './tenant.service';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { TenantControlRecord } from './entities/tenant-control-record.entity';
import { TenantMode } from './interfaces/tenant-config.interface';
import axios from 'axios';

interface RegionalCapacity {
  load: number;
  observedAt: Date;
  source: 'prometheus' | 'control-plane';
}

@Injectable()
export class RoutingPlaneService {
  private readonly logger = new Logger(RoutingPlaneService.name);
  private readonly hmacSecret: string;
  private readonly maxHealthStalenessMs: number;

  constructor(
    private readonly em: EntityManager,
    private readonly tenantService: TenantService,
    private readonly configService: ConfigService,
  ) {
    const secret = this.configService.get<string>('ROUTING_SNAPSHOT_SECRET');
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    if (!secret || secret === 'dev-secret-change-in-prod') {
      if (isProduction) {
        this.logger.error(
          '[SECURITY CRITICAL] Insecure or missing ROUTING_SNAPSHOT_SECRET',
        );
        throw new Error(
          'Insecure routing configuration: ROUTING_SNAPSHOT_SECRET must be set and secure',
        );
      }

      this.hmacSecret = randomBytes(32).toString('hex');
      this.logger.warn(
        '[SECURITY] ROUTING_SNAPSHOT_SECRET not provided. Generated ephemeral secret for non-production runtime.',
      );
    } else {
      this.hmacSecret = secret;
    }
    this.maxHealthStalenessMs = Number(
      this.configService.get('ROUTING_HEALTH_MAX_STALENESS_MS') ?? 120000,
    );
  }

  async resolveRoute(tenantId: string): Promise<any> {
    const snapshot = await this.em.findOne(TenantRoutingSnapshot, { tenantId });

    if (snapshot) {
      if (!this.verifySnapshot(snapshot)) {
        this.logger.error(
          `[SECURITY] Tampered routing snapshot detected for tenant ${tenantId}`,
        );
        throw new ForbiddenException('Routing snapshot integrity violation');
      }

      if (this.isExpired(snapshot)) {
        this.logger.warn(
          `Routing snapshot for ${tenantId} EXPIRED. Re-evaluating policies.`,
        );
      } else {
        return snapshot.routeTargets;
      }
    }

    return this.evaluateRoutingPolicies(tenantId);
  }

  async enforceProxyRoute(input: {
    tenantId: string;
    service: string;
    requestedTarget: string;
    generation?: number;
    signature?: string;
  }): Promise<{ target: string; generation: number; signature: string }> {
    const snapshot = await this.em.findOne(TenantRoutingSnapshot, {
      tenantId: input.tenantId,
    });

    if (
      !snapshot ||
      !this.verifySnapshot(snapshot) ||
      this.isExpired(snapshot)
    ) {
      throw new ForbiddenException(
        'No valid routing snapshot available for proxy enforcement',
      );
    }

    const serviceTarget =
      snapshot.routeTargets?.serviceEndpoints?.[input.service];
    if (!serviceTarget?.url) {
      throw new ForbiddenException(
        `Service ${input.service} is not allowed by routing snapshot`,
      );
    }

    if (input.generation && input.generation !== snapshot.generation) {
      throw new ConflictException(
        `Routing generation fence violation for tenant ${input.tenantId}`,
      );
    }

    if (input.signature && input.signature !== snapshot.signature) {
      throw new ForbiddenException(
        `Routing signature mismatch for tenant ${input.tenantId}`,
      );
    }

    if (serviceTarget.url !== input.requestedTarget) {
      throw new ForbiddenException(
        `Requested route target deviates from signed routing snapshot`,
      );
    }

    return {
      target: serviceTarget.url,
      generation: snapshot.generation,
      signature: snapshot.signature,
    };
  }

  private async evaluateRoutingPolicies(tenantId: string): Promise<any> {
    this.logger.log(
      `Evaluating industrial routing policies for tenant ${tenantId}`,
    );

    const config = await this.tenantService.getTenantConfig(tenantId);
    const control = await this.em.findOne(TenantControlRecord, { tenantId });

    if (!control) {
      throw new Error(
        `Tenant ${tenantId} has no control record. Routing impossible.`,
      );
    }

    const allowedRegion =
      config.settings?.['allowedRegion'] || control.primaryRegion;
    const primary =
      control.status === 'DEGRADED'
        ? control.secondaryRegion
        : control.primaryRegion;
    const secondary =
      control.status === 'DEGRADED'
        ? control.primaryRegion
        : control.secondaryRegion;

    const capacity = await this.getRegionalCapacity(primary);
    if (capacity.load > 0.85) {
      this.logger.warn(
        `Region ${primary} is at high capacity (${(capacity.load * 100).toFixed(2)}%).`,
      );
    }

    const serviceEndpoints = await this.resolveServiceEndpoints({
      tenantId,
      mode: config.mode,
      primaryRegion: primary,
      settings: config.settings,
    });

    const targets = {
      tenantId,
      mode: config.mode,
      primaryRegion: primary,
      secondaryRegion: secondary,
      allowedRegion,
      serviceEndpoints,
      failoverActive: control.status === 'DEGRADED',
      status: control.status,
      version: control.version,
      observedLoad: capacity.load,
      observedLoadAt: capacity.observedAt.toISOString(),
      observedLoadSource: capacity.source,
      updatedAt: new Date().toISOString(),
      policyEngine: 'v5.1-industrial-ga',
    };

    await this.createSnapshot(tenantId, targets, {
      expectedGeneration: undefined,
    });
    return targets;
  }

  async createSnapshot(
    tenantId: string,
    targets: any,
    options?: { expectedGeneration?: number },
  ): Promise<TenantRoutingSnapshot> {
    const existing = await this.em.findOne(TenantRoutingSnapshot, { tenantId });

    if (
      typeof options?.expectedGeneration === 'number' &&
      (existing?.generation ?? 0) !== options.expectedGeneration
    ) {
      throw new ConflictException(
        `Snapshot generation fence violation for tenant ${tenantId}. Expected ${options.expectedGeneration}, got ${existing?.generation ?? 0}`,
      );
    }

    const generation = existing ? existing.generation + 1 : 1;
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
      snapshot = this.em.create(TenantRoutingSnapshot, {
        ...snapshotData,
        signature,
      });
      this.em.persist(snapshot);
    }

    await this.em.flush();
    this.logger.log(
      `Signed routing snapshot PERSISTED for ${tenantId} (Gen ${generation}).`,
    );
    return snapshot;
  }

  private async resolveServiceEndpoints(input: {
    tenantId: string;
    mode: TenantMode;
    primaryRegion: string;
    settings?: Record<string, any>;
  }): Promise<
    Record<string, { url: string; version: string; source: string }>
  > {
    const fromControlPlane =
      await this.getVersionedEndpointsFromControlPlane(input);
    if (fromControlPlane) {
      return fromControlPlane;
    }

    const catalog = input.settings?.['endpointCatalog'];
    if (catalog && typeof catalog === 'object') {
      const modeCatalog = catalog[input.mode] || catalog['default'];
      const regionCatalog =
        modeCatalog?.[input.primaryRegion] || modeCatalog?.default;
      if (regionCatalog && typeof regionCatalog === 'object') {
        return regionCatalog;
      }
    }

    throw new Error(
      `No explicit endpoint resolution found for tenant ${input.tenantId} mode=${input.mode} region=${input.primaryRegion}`,
    );
  }

  private async getVersionedEndpointsFromControlPlane(input: {
    tenantId: string;
    mode: TenantMode;
    primaryRegion: string;
  }): Promise<Record<
    string,
    { url: string; version: string; source: string }
  > | null> {
    try {
      const rows = await this.em.getConnection().execute(
        `SELECT service, endpoint, endpoint_version, source, observed_at
         FROM tenant_endpoint_resolutions
         WHERE tenant_id = ? AND tenant_mode = ? AND region = ?
         ORDER BY observed_at DESC`,
        [input.tenantId, input.mode, input.primaryRegion],
      );

      if (!rows || rows.length === 0) {
        return null;
      }

      const newest = new Date(rows[0].observed_at);
      if (Date.now() - newest.getTime() > this.maxHealthStalenessMs) {
        throw new Error('Endpoint resolution snapshot is stale');
      }

      return rows.reduce(
        (
          acc: Record<string, { url: string; version: string; source: string }>,
          row: any,
        ) => {
          acc[row.service] = {
            url: row.endpoint,
            version: row.endpoint_version,
            source: row.source || 'control-plane-db',
          };
          return acc;
        },
        {},
      );
    } catch (err) {
      this.logger.warn(
        `Unable to resolve control-plane endpoints for ${input.tenantId}: ${err instanceof Error ? err.message : String(err)}`,
      );
      return null;
    }
  }

  private calculateSignature(data: any): string {
    const payload = JSON.stringify({
      tenantId: data.tenantId,
      generation: data.generation,
      routeTargets: data.routeTargets,
      issuedAt:
        data.issuedAt instanceof Date
          ? data.issuedAt.toISOString()
          : data.issuedAt,
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

  private async getRegionalCapacity(region: string): Promise<RegionalCapacity> {
    const fromPrometheus =
      await this.getRegionalCapacityFromPrometheusMirror(region);
    if (fromPrometheus) {
      return fromPrometheus;
    }

    const fromControlPlane =
      await this.getRegionalCapacityFromControlPlane(region);
    if (fromControlPlane) {
      return fromControlPlane;
    }

    throw new Error(`No fresh regional capacity signal for ${region}`);
  }

  private async getRegionalCapacityFromPrometheusMirror(
    region: string,
  ): Promise<RegionalCapacity | null> {
    try {
      const result = await this.em.getConnection().execute(
        `SELECT load_factor, observed_at
         FROM platform_regional_metrics
         WHERE region = ?
         ORDER BY observed_at DESC
         LIMIT 1`,
        [region],
      );

      if (!result?.length) {
        return null;
      }

      const observedAt = new Date(result[0].observed_at);
      if (Date.now() - observedAt.getTime() > this.maxHealthStalenessMs) {
        throw new Error(`Prometheus capacity signal for ${region} is stale`);
      }

      return {
        load: parseFloat(result[0].load_factor),
        observedAt,
        source: 'prometheus',
      };
    } catch (err) {
      this.logger.warn(
        `[ROUTING] Prometheus mirror unavailable for ${region}: ${err instanceof Error ? err.message : String(err)}`,
      );
      return null;
    }
  }

  private async getRegionalCapacityFromControlPlane(
    region: string,
  ): Promise<RegionalCapacity | null> {
    const baseUrl = this.configService.get<string>('CONTROL_PLANE_URL');
    if (!baseUrl) {
      return null;
    }

    try {
      const response = await axios.get(
        `${baseUrl}/v1/routing/capacity/${region}`,
        { timeout: 3000 },
      );
      const payload = response.data as {
        loadFactor: number;
        observedAt: string;
      };
      const observedAt = new Date(payload.observedAt);
      if (Date.now() - observedAt.getTime() > this.maxHealthStalenessMs) {
        throw new Error(`Control-plane capacity signal for ${region} is stale`);
      }
      return { load: payload.loadFactor, observedAt, source: 'control-plane' };
    } catch (err) {
      this.logger.warn(
        `[ROUTING] Control-plane capacity unavailable for ${region}: ${err instanceof Error ? err.message : String(err)}`,
      );
      return null;
    }
  }
}
