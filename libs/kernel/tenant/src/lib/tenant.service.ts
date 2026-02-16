import { Injectable, OnModuleDestroy, OnModuleInit, NotFoundException, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TenantConfig } from './interfaces/tenant-config.interface';
import { Tenant } from './entities/tenant.entity';
import Redis from 'ioredis';

@Injectable()
export class TenantService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TenantService.name);
  private redis: Redis | null = null;
  private readonly TTL = 60; // 1 minute cache (Redis uses seconds)

  constructor(private readonly em: EntityManager) {}

  onModuleInit() {
    if (process.env['REDIS_URL']) {
      this.redis = new Redis(process.env['REDIS_URL'], {
        retryStrategy: (times) => Math.min(times * 50, 2000),
      });
      this.redis.on('error', (err) => this.logger.error('Redis error:', err));
    } else {
      this.logger.warn('REDIS_URL not set. TenantService will fallback to DB-only mode.');
    }
  }

  onModuleDestroy() {
    this.redis?.disconnect();
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
        this.logger.error('Redis get failed, falling back to DB', error);
      }
    }

    // 2. Fetch from DB
    const tenant = await this.em.findOne(Tenant, { id: tenantId });

    if (!tenant) {
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
         this.logger.error('Redis set failed', error);
      }
    }
    return config;
  }
}
