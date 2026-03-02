import { Injectable, Inject } from '@nestjs/common';
import { CachePort } from '@virteex/domain-identity-domain';
import { RedisCacheService } from '@virteex/platform-cache';

@Injectable()
export class RedisCacheAdapter implements CachePort {
  constructor(private readonly redis: RedisCacheService) {}

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    return this.redis.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    return this.redis.del(key);
  }
}
