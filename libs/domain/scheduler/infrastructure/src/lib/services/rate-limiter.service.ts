import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { Inject } from '@nestjs/common';

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async checkLimit(tenantId: string, limitKey: string, maxRequests: number, windowSeconds: number): Promise<boolean> {
    const key = `ratelimit:${tenantId}:${limitKey}`;
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, windowSeconds);
    }

    if (current > maxRequests) {
      this.logger.warn(`Rate limit exceeded for tenant ${tenantId} on ${limitKey}`);
      return false;
    }

    return true;
  }
}
