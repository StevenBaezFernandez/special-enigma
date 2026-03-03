import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TenantRoutingSnapshot } from './entities/tenant-routing-snapshot.entity';
import { TenantService } from './tenant.service';
import { createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RoutingPlaneService {
  private readonly logger = new Logger(RoutingPlaneService.name);
  private readonly hmacSecret: string;

  constructor(
    private readonly em: EntityManager,
    private readonly tenantService: TenantService,
    private readonly configService: ConfigService
  ) {
    this.hmacSecret = this.configService.get<string>('ROUTING_SNAPSHOT_SECRET') || 'dev-secret-change-in-prod';
  }

  async resolveRoute(tenantId: string): Promise<any> {
    const snapshot = await this.em.findOne(TenantRoutingSnapshot, { tenantId });

    if (snapshot && this.verifySnapshot(snapshot)) {
      this.logger.log(`Routing tenant ${tenantId} via signed snapshot generation ${snapshot.generation}`);
      return snapshot.routeTargets;
    }

    this.logger.warn(`No valid signed snapshot for tenant ${tenantId}. Resolving via TenantService (Slow Path).`);
    const config = await this.tenantService.getTenantConfig(tenantId);

    const targets = {
      mode: config.mode,
      region: config.settings?.['allowedRegion'] || 'us-east-1',
      endpoint: config.connectionString || 'shared-pool',
    };

    await this.createSnapshot(tenantId, targets);
    return targets;
  }

  async createSnapshot(tenantId: string, targets: any): Promise<TenantRoutingSnapshot> {
    const existing = await this.em.findOne(TenantRoutingSnapshot, { tenantId });
    const generation = existing ? existing.generation + 1 : 1;

    const snapshot = this.em.create(TenantRoutingSnapshot, {
      tenantId,
      generation,
      routeTargets: targets,
      issuedAt: new Date(),
      signature: '',
    });

    snapshot.signature = this.signSnapshot(snapshot);

    if (existing) {
        this.em.assign(existing, snapshot);
    } else {
        this.em.persist(snapshot);
    }

    await this.em.flush();
    this.logger.log(`Created new signed routing snapshot for tenant ${tenantId} (Gen ${generation})`);
    return snapshot;
  }

  private signSnapshot(snapshot: TenantRoutingSnapshot): string {
    const payload = JSON.stringify({
      tenantId: snapshot.tenantId,
      generation: snapshot.generation,
      routeTargets: snapshot.routeTargets,
      issuedAt: snapshot.issuedAt.toISOString(),
    });

    return createHmac('sha256', this.hmacSecret).update(payload).digest('hex');
  }

  private verifySnapshot(snapshot: TenantRoutingSnapshot): boolean {
    const expected = this.signSnapshot(snapshot);
    return snapshot.signature === expected;
  }
}
