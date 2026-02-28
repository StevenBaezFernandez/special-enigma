import { Test, TestingModule } from '@nestjs/testing';
import { RedisCacheService } from './redis-cache.service';
import Redis from 'ioredis';

describe('RedisCacheService', () => {
  let service: RedisCacheService;
  let redisClient: jest.Mocked<Redis>;

  beforeEach(async () => {
    // Mock Redis client
    redisClient = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      disconnect: jest.fn(),
    } as unknown as jest.Mocked<Redis>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisCacheService,
        {
          provide: 'REDIS_CLIENT',
          useValue: redisClient,
        },
      ],
    }).compile();

    service = module.get<RedisCacheService>(RedisCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get value from redis', async () => {
    (redisClient.get as jest.Mock).mockResolvedValue('value');
    const result = await service.get('key');
    expect(result).toBe('value');
    expect(redisClient.get).toHaveBeenCalledWith('key');
  });

  it('should set value in redis', async () => {
    await service.set('key', 'value');
    expect(redisClient.set).toHaveBeenCalledWith('key', 'value');
  });

  it('should set value with ttl in redis', async () => {
    await service.set('key', 'value', 60);
    expect(redisClient.set).toHaveBeenCalledWith('key', 'value', 'EX', 60);
  });
});
