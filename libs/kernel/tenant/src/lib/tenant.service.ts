import { Injectable, OnModuleDestroy, OnModuleInit, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TenantConfig, TenantMode, TenantStatus } from './interfaces/tenant-config.interface';
import { Tenant } from './entities/tenant.entity';
import { TenantControlRecord } from './entities/tenant-control-record.entity';
import Redis from 'ioredis';
import { createHmac } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface CreateTenantInput {
  id: string;
  mode: TenantMode;
  primaryRegion: string;
  secondaryRegion: string;
  complianceProfile: string;
  connectionString?: string;
  schemaName?: string;
  settings?: Record<string, unknown>;
  keys: {
    kmsKeyId: string;
    signingKeyId: string;
  };
}

@Injectable()
export class TenantService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TenantService.name);
  private redis: Redis | null = null;
  private readonly TTL = 3600; // 1 hour cache (Redis uses seconds)

  constructor(private readonly em: EntityManager) {}

  onModuleInit() {
    if (process.env['REDIS_URL']) {
      try {
        this.redis = new Redis(process.env['REDIS_URL'], {
            retryStrategy: (times) => Math.min(times * 100, 3000), // More robust retry
            maxRetriesPerRequest: 3,
        });
        this.redis.on('error', (err) => this.logger.error('Redis connection error:', err));
      } catch (e) {
        this.logger.error('Failed to initialize Redis client', e);
      }
    } else {
      this.logger.warn('REDIS_URL not set. TenantService will operate in DB-only mode (slower performance).');
    }
  }

  onModuleDestroy() {
    this.redis?.disconnect();
  }

  async createTenant(tenantData: CreateTenantInput): Promise<Tenant> {
    this.validateCreateTenantInput(tenantData);

    const exists = await this.em.findOne(Tenant, { id: tenantData.id });
    if (exists) {
        throw new ConflictException(`Tenant ${tenantData.id} already exists`);
    }

    const tenant = this.em.create(Tenant, {
      id: tenantData.id,
      mode: tenantData.mode,
      connectionString: tenantData.connectionString,
      schemaName: tenantData.schemaName,
      settings: {
        ...(tenantData.settings ?? {}),
        primaryRegion: tenantData.primaryRegion,
        secondaryRegion: tenantData.secondaryRegion,
        complianceProfile: tenantData.complianceProfile,
        keys: tenantData.keys,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(tenant);

    // Level 5: Initialize Control Record with proper lifecycle state
    const control = this.em.create(TenantControlRecord, {
        tenantId: tenant.id,
        mode: tenantData.mode,
        primaryRegion: tenantData.primaryRegion,
        secondaryRegion: tenantData.secondaryRegion,
        complianceProfile: tenantData.complianceProfile,
        status: TenantStatus.PROVISIONING,
        version: 1,
        isFrozen: false,
        fenceGeneration: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    await this.em.persistAndFlush(control);

    if (this.redis) {
        await this.redis.del(`tenant:${tenant.id}`);
    }

    return tenant;
  }

  async activateTenant(tenantId: string): Promise<void> {
    await this.updateTenantStatus(tenantId, TenantStatus.ACTIVE);
    await this.generateLifecycleEvidence(tenantId, 'ACTIVATE');
    this.logger.log(`[LIFECYCLE] Tenant ${tenantId} ACTIVATED.`);
  }

  async suspendTenant(tenantId: string): Promise<void> {
    await this.updateTenantStatus(tenantId, TenantStatus.SUSPENDED);
    await this.generateLifecycleEvidence(tenantId, 'SUSPEND');
    this.logger.warn(`[LIFECYCLE] Tenant ${tenantId} SUSPENDED.`);
  }

  async terminateTenant(tenantId: string): Promise<void> {
    const control = await this.em.findOneOrFail(TenantControlRecord, { tenantId });
    control.isFrozen = true;
    await this.updateTenantStatus(tenantId, TenantStatus.ARCHIVED);
    await this.generateLifecycleEvidence(tenantId, 'TERMINATE');
    this.logger.warn(`[LIFECYCLE] Tenant ${tenantId} marked for termination and ARCHIVED. Writes frozen.`);
  }

  async legalHoldTenant(tenantId: string): Promise<void> {
    const control = await this.em.findOneOrFail(TenantControlRecord, { tenantId });
    control.isFrozen = true;
    await this.updateTenantStatus(tenantId, TenantStatus.LEGAL_HOLD);
    await this.generateLifecycleEvidence(tenantId, 'LEGAL_HOLD');
    this.logger.warn(`[LIFECYCLE] Tenant ${tenantId} placed on LEGAL HOLD. Writes frozen.`);
  }

  async purgeTenant(tenantId: string): Promise<void> {
    const control = await this.em.findOneOrFail(TenantControlRecord, { tenantId });
    if (control.status !== TenantStatus.ARCHIVED) {
        throw new ConflictException(`Tenant ${tenantId} must be ARCHIVED before purging.`);
    }

    const config = await this.getTenantConfig(tenantId);
    this.logger.error(`Tenant ${tenantId} is being PURGED. Executing industrial data deletion.`);

    if (config.mode === TenantMode.DATABASE) {
        // Full database dropping for isolated instances
        const tenantEm = (this.em as any).fork({ connectionString: config.connectionString });
        const dbName = this.assertSafeIdentifier(config.connectionString?.split('/').pop()?.split('?')[0], 'database');
        await tenantEm.getConnection().execute(`DROP DATABASE IF EXISTS "${dbName}"`);
    } else {
        // Level 5: Declarative purging based on database metadata
        const schema = config.mode === TenantMode.SCHEMA
          ? this.assertSafeIdentifier(config.schemaName || `tenant_${tenantId}`, 'schema')
          : 'public';

        // Discover all tables that have a tenant_id column
        const tablesWithTenantIdResult = await this.em.getConnection().execute(`
            SELECT table_name
            FROM information_schema.columns
            WHERE column_name = 'tenant_id'
            AND table_schema = ?
        `, [config.mode === TenantMode.SCHEMA ? schema : 'public']);

        const tables = tablesWithTenantIdResult.map((r: any) => r.table_name);

        await this.em.transactional(async (tx) => {
            for (const table of tables) {
                const safeTable = this.assertSafeIdentifier(table, 'table');
                const target = config.mode === TenantMode.SCHEMA ? `"${schema}"."${safeTable}"` : `"${safeTable}"`;
                if (config.mode === TenantMode.SHARED) {
                  await tx.getConnection().execute(`DELETE FROM ${target} WHERE tenant_id = ?`, [tenantId]);
                } else {
                  await tx.getConnection().execute(`DELETE FROM ${target}`);
                }
            }
        });

        if (config.mode === TenantMode.SCHEMA) {
            await this.em.getConnection().execute(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
        }
    }

    await this.updateTenantStatus(tenantId, TenantStatus.PURGED);
    await this.generateLifecycleEvidence(tenantId, 'PURGE');
    this.logger.error(`Tenant ${tenantId} data has been completely removed using declarative discovery.`);
  }

  private assertSafeIdentifier(identifier: string | undefined, type: string): string {
    if (!identifier || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
      throw new ConflictException(`Unsafe ${type} identifier: ${identifier ?? 'undefined'}`);
    }
    return identifier;
  }

  async reopenTenant(tenantId: string): Promise<void> {
    const control = await this.em.findOneOrFail(TenantControlRecord, { tenantId });
    if (control.status === TenantStatus.PURGED) {
        throw new ConflictException(`Cannot reopen PURGED tenant ${tenantId}.`);
    }
    await this.updateTenantStatus(tenantId, TenantStatus.ACTIVE);
    await this.generateLifecycleEvidence(tenantId, 'REOPEN');
  }

  private async updateTenantStatus(tenantId: string, status: TenantStatus): Promise<void> {
    const control = await this.em.findOneOrFail(TenantControlRecord, { tenantId });
    control.status = status;
    control.updatedAt = new Date();
    await this.em.flush();

    if (this.redis) {
        await this.redis.del(`tenant:${tenantId}`);
    }
    this.logger.log(`Tenant ${tenantId} status updated to ${status}`);
  }

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    const tenant = await this.em.findOneOrFail(Tenant, { id });
    this.em.assign(tenant, updates);
    await this.em.flush();

    if (this.redis) {
        await this.redis.del(`tenant:${id}`);
    }

    return tenant;
  }

  async listTenants(limit = 20, offset = 0): Promise<Tenant[]> {
      return this.em.find(Tenant, {}, { limit, offset, orderBy: { createdAt: 'DESC' } });
  }

  async getTenantConfig(tenantId: string): Promise<TenantConfig> {
    // 1. Check Redis Cache
    if (this.redis) {
      try {
        const cached = await this.redis.get(`tenant:${tenantId}`);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (error) {
        this.logger.error(`Redis get failed for tenant:${tenantId}, falling back to DB`, error);
      }
    }

    // 2. Fetch from DB
    const tenant = await this.em.findOne(Tenant, { id: tenantId });

    if (!tenant) {
        this.logger.warn(`Tenant ${tenantId} not found in DB`);
        throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    const config: TenantConfig = {
        tenantId: tenant.id,
        mode: tenant.mode,
        connectionString: tenant.connectionString,
        schemaName: tenant.schemaName,
        settings: tenant.settings,
    };

    // 3. Update Redis Cache
    if (this.redis && config) {
      try {
        await this.redis.set(`tenant:${tenantId}`, JSON.stringify(config), 'EX', this.TTL);
      } catch (error) {
         this.logger.error(`Redis set failed for tenant:${tenantId}`, error);
      }
    }
    return config;
  }

  private validateCreateTenantInput(input: CreateTenantInput): void {
    if (!input.id || !input.mode || !input.primaryRegion || !input.secondaryRegion || !input.complianceProfile) {
      throw new ConflictException('createTenant requires id, mode, primaryRegion, secondaryRegion and complianceProfile');
    }

    if (!input.keys?.kmsKeyId || !input.keys?.signingKeyId) {
      throw new ConflictException('createTenant requires keys.kmsKeyId and keys.signingKeyId');
    }

    if (input.mode === TenantMode.SCHEMA && !input.schemaName) {
      throw new ConflictException('schemaName is required for SCHEMA mode');
    }

    if (input.mode === TenantMode.DATABASE && !input.connectionString) {
      throw new ConflictException('connectionString is required for DATABASE mode');
    }
  }

  private async generateLifecycleEvidence(tenantId: string, action: string): Promise<void> {
    const control = await this.em.findOneOrFail(TenantControlRecord, { tenantId });
    const evidence = {
      tenantId,
      action,
      status: control.status,
      isFrozen: control.isFrozen,
      timestamp: new Date().toISOString(),
      environment: process.env['NODE_ENV'] || 'development',
      region: process.env['AWS_REGION'] || 'us-east-1',
      version: control.version,
    };

    const secret = process.env['EVIDENCE_SIGNING_SECRET'];

    if (!secret) {
      this.logger.error(`[SECURITY] EVIDENCE_SIGNING_SECRET missing. Evidence for ${action} on ${tenantId} NOT SIGNED. Certification Level 5 requires a valid signing secret.`);
      throw new Error(`EVIDENCE_SIGNING_SECRET is mandatory for tenant lifecycle evidence in enterprise mode.`);
    }

    const signature = createHmac('sha256', secret).update(JSON.stringify(evidence)).digest('hex');
    const signedEvidence = { ...evidence, signature, signatureAlgorithm: 'HMAC-SHA256' };

    const evidenceDir = path.join(process.cwd(), 'evidence/tenant-lifecycle');
    if (!fs.existsSync(evidenceDir)) {
      fs.mkdirSync(evidenceDir, { recursive: true });
    }

    const filename = `${new Date().toISOString().split('T')[0]}-${tenantId}-${action}.json`;
    const evidencePath = path.join(evidenceDir, filename);

    fs.writeFileSync(evidencePath, JSON.stringify(signedEvidence, null, 2));
    this.logger.log(`[LIFECYCLE EVIDENCE] Signed evidence persisted at ${evidencePath}`);
  }
}
