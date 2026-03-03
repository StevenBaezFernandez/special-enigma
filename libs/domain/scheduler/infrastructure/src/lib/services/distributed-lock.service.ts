import { Injectable, Logger, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { v4 } from 'uuid';

@Injectable()
export class DistributedLockService {
  private readonly logger = new Logger(DistributedLockService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async acquire(resource: string, ttlMs: number): Promise<string | null> {
    const fencingToken = v4();
    const result = await this.redis.set(
      `lock:${resource}`,
      fencingToken,
      'PX',
      ttlMs,
      'NX'
    );

    if (result === 'OK') {
      this.logger.debug(`Acquired lock for ${resource} with token ${fencingToken}`);
      return fencingToken;
    }

    return null;
  }

  async release(resource: string, token: string): Promise<boolean> {
    // Lua script for atomic check and delete
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    const result = await this.redis.eval(script, 1, `lock:${resource}`, token);
    return result === 1;
  }

  async validate(resource: string, token: string): Promise<boolean> {
    const currentToken = await this.redis.get(`lock:${resource}`);
    return currentToken === token;
  }
}
