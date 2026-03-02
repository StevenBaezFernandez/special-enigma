import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { TenantService } from './tenant.service';
import { TenantMode } from './interfaces/tenant-config.interface';

describe('TenantService', () => {
  let service: TenantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: EntityManager,
          useValue: {
            findOne: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return SHARED mode by default', async () => {
    const config = await service.getTenantConfig('tenant-123');
    expect(config.mode).toBe(TenantMode.SHARED);
    expect(config.tenantId).toBe('tenant-123');
  });

  it('should return SCHEMA mode for tenants starting with schema_', async () => {
    const config = await service.getTenantConfig('schema_tenant_1');
    expect(config.mode).toBe(TenantMode.SCHEMA);
    expect(config.schemaName).toBe('tenant_schema_tenant_1');
  });
});
