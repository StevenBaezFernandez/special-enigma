import { Module, Global, DynamicModule } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';
import Redis, { RedisOptions } from 'ioredis';

@Global()
@Module({})
export class RedisCacheModule {
  static forRoot(options: RedisOptions): DynamicModule {
    return {
      module: RedisCacheModule,
      providers: [
        {
          provide: 'REDIS_CLIENT',
          useFactory: () => new Redis(options),
        },
        RedisCacheService,
      ],
      exports: [RedisCacheService, 'REDIS_CLIENT'],
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<RedisOptions | string> | RedisOptions | string;
    inject?: any[];
  }): DynamicModule {
    return {
      module: RedisCacheModule,
      providers: [
        {
          provide: 'REDIS_CLIENT',
          useFactory: async (...args) => {
             const config = await options.useFactory(...args);
             // ioredis constructor handles both options object and URL string
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             return new Redis(config as any);
          },
          inject: options.inject || [],
        },
        RedisCacheService,
      ],
      exports: [RedisCacheService, 'REDIS_CLIENT'],
    };
  }
}
