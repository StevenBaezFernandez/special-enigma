import { Injectable, OnModuleDestroy, OnModuleInit, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TenantConfig, TenantMode } from './interfaces/tenant-config.interface';
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

    // Invalidate cache immediately just in case
    if (this.redis) {
        await this.redis.del(`tenant:${tenant.id}`);
    }

    return tenant;
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
