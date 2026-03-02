import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { TenantService } from './tenant.service';
import { TenantMode } from './interfaces/tenant-config.interface';
import { Tenant } from './entities/tenant.entity';

describe('TenantService', () => {
  let service: TenantService;
  const mockEm = {
    findOne: vi.fn(),
    create: vi.fn(),
    persistAndFlush: vi.fn(),
    find: vi.fn(),
    assign: vi.fn(),
    flush: vi.fn(),
    findOneOrFail: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: EntityManager,
          useValue: mockEm,
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return config from DB if not in cache', async () => {
    const mockTenant = { id: 't1', mode: TenantMode.SHARED };
    mockEm.findOne.mockResolvedValue(mockTenant);

    const config = await service.getTenantConfig('t1');
    expect(config.tenantId).toBe('t1');
    expect(config.mode).toBe(TenantMode.SHARED);
  });
});
