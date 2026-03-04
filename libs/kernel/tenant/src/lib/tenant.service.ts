import { Injectable, OnModuleDestroy, OnModuleInit, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TenantConfig, TenantMode, TenantStatus } from './interfaces/tenant-config.interface';
import { Tenant } from './entities/tenant.entity';
import Redis from 'ioredis';

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

  async createTenant(tenantData: Partial<Tenant>): Promise<Tenant> {
    const exists = await this.em.findOne(Tenant, { id: tenantData.id });
    if (exists) {
        throw new ConflictException(`Tenant ${tenantData.id} already exists`);
    }

    const tenant = this.em.create(Tenant, {
      mode: tenantData.mode ?? TenantMode.SHARED,
      createdAt: tenantData.createdAt ?? new Date(),
      updatedAt: tenantData.updatedAt ?? new Date(),
      ...tenantData,
    });

    await this.em.persistAndFlush(tenant);

    // Level 5: Initialize Control Record with proper lifecycle state
    const control = this.em.create('TenantControlRecord', {
        tenantId: tenant.id,
        status: TenantStatus.PROVISIONING,
        version: 1,
        isFrozen: false,
        primaryRegion: tenantData.settings?.['allowedRegion'] || process.env['AWS_REGION'] || 'us-east-1'
    } as any);
    await this.em.persistAndFlush(control);

    if (this.redis) {
        await this.redis.del(`tenant:${tenant.id}`);
    }

    return tenant;
  }

  async activateTenant(tenantId: string): Promise<void> {
    await this.updateTenantStatus(tenantId, TenantStatus.ACTIVE);
    this.logger.log(`[LIFECYCLE] Tenant ${tenantId} ACTIVATED.`);
  }

  async suspendTenant(tenantId: string): Promise<void> {
    await this.updateTenantStatus(tenantId, TenantStatus.SUSPENDED);
    this.logger.warn(`[LIFECYCLE] Tenant ${tenantId} SUSPENDED.`);
  }

  async terminateTenant(tenantId: string): Promise<void> {
    const control = await this.em.findOneOrFail('TenantControlRecord', { tenantId } as any);
    (control as any).isFrozen = true;
    await this.updateTenantStatus(tenantId, TenantStatus.ARCHIVED);
    this.logger.warn(`[LIFECYCLE] Tenant ${tenantId} marked for termination and ARCHIVED. Writes frozen.`);
  }

  async legalHoldTenant(tenantId: string): Promise<void> {
    const control = await this.em.findOneOrFail('TenantControlRecord', { tenantId } as any);
    (control as any).isFrozen = true;
    await this.updateTenantStatus(tenantId, TenantStatus.LEGAL_HOLD);
    this.logger.warn(`[LIFECYCLE] Tenant ${tenantId} placed on LEGAL HOLD. Writes frozen.`);
  }

  async purgeTenant(tenantId: string): Promise<void> {
    const control = await this.em.findOneOrFail('TenantControlRecord', { tenantId } as any);
    if ((control as any).status !== TenantStatus.ARCHIVED) {
        throw new ConflictException(`Tenant ${tenantId} must be ARCHIVED before purging.`);
    }

    const config = await this.getTenantConfig(tenantId);
    this.logger.error(`Tenant ${tenantId} is being PURGED. Executing industrial data deletion.`);

    if (config.mode === TenantMode.DATABASE) {
        // Full database dropping for isolated instances
        const tenantEm = this.em.fork({ connectionString: config.connectionString });
        const dbName = config.connectionString?.split('/').pop()?.split('?')[0];
        await tenantEm.getConnection().execute(`DROP DATABASE IF EXISTS "${dbName}"`);
    } else {
        // Level 5: Declarative purging based on database metadata
        const schema = config.schemaName || 'public';

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
                const target = config.mode === TenantMode.SCHEMA ? `"${schema}"."${table}"` : `"${table}"`;
                const where = config.mode === TenantMode.SHARED ? ` WHERE tenant_id = '${tenantId}'` : '';
                await tx.getConnection().execute(`DELETE FROM ${target}${where}`);
            }
        });

        if (config.mode === TenantMode.SCHEMA) {
            await this.em.getConnection().execute(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
        }
    }

    await this.updateTenantStatus(tenantId, TenantStatus.PURGED);
    this.logger.error(`Tenant ${tenantId} data has been completely removed using declarative discovery.`);
  }

  async reopenTenant(tenantId: string): Promise<void> {
    const control = await this.em.findOneOrFail('TenantControlRecord', { tenantId } as any);
    if ((control as any).status === TenantStatus.PURGED) {
        throw new ConflictException(`Cannot reopen PURGED tenant ${tenantId}.`);
    }
    await this.updateTenantStatus(tenantId, TenantStatus.ACTIVE);
  }

  private async updateTenantStatus(tenantId: string, status: TenantStatus): Promise<void> {
    const control = await this.em.findOneOrFail('TenantControlRecord', { tenantId } as any);
    (control as any).status = status;
    (control as any).updatedAt = new Date();
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
}
