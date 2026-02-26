import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class IdempotencyService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;
  private readonly logger = new Logger(IdempotencyService.name);

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    // Use lazyConnect so we don't crash if Redis is missing during build/test
    this.redis = new Redis({
      host,
      port,
      lazyConnect: true,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });
  }

  async onModuleInit() {
    try {
        await this.redis.connect();
        this.logger.log('Redis connected for Idempotency');
    } catch (e) {
        this.logger.warn('Redis connection failed. Idempotency service will fail safely (or retry).', e);
    }
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  async getResponse(key: string): Promise<any> {
    try {
      if (this.redis.status !== 'ready') return null;
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      this.logger.error(`Failed to get key ${key}`, e);
      return null;
    }
  }

  async setResponse(key: string, response: any, ttlSeconds = 86400): Promise<boolean> {
    try {
      if (this.redis.status !== 'ready') return false;
      // Using set with NX (Not Exists) to prevent overwriting if another request raced
      // Returns 'OK' if set, null if not set
      const result = await this.redis.set(key, JSON.stringify(response), 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    } catch (e) {
      this.logger.error(`Failed to set key ${key}`, e);
      return false;
    }
  }
}
