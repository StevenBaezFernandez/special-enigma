import { Test, TestingModule } from '@nestjs/testing';
import { RateLimiterService } from './rate-limiter.service';
import Redis from 'ioredis';

describe('RateLimiterService', () => {
  let service: RateLimiterService;
  let redis: Redis;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimiterService,
        {
          provide: 'REDIS_CLIENT',
          useValue: {
            incr: vi.fn(),
            expire: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RateLimiterService>(RateLimiterService);
    redis = module.get<Redis>('REDIS_CLIENT');
  });

  it('should reject request when limit is exceeded', async () => {
    (redis.incr as any).mockResolvedValue(11);

    const result = await service.checkLimit('tenant-1', 'email', 10, 60);
    expect(result).toBe(false);
  });
});
