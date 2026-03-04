import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { ConflictException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantMode, TenantStatus } from './interfaces/tenant-config.interface';
import { TenantControlRecord } from './entities/tenant-control-record.entity';

describe('TenantService', () => {
  let service: TenantService;

  const execute = vi.fn();
  const txExecute = vi.fn();
  const mockConnection = { execute };
  const mockTxConnection = { execute: txExecute };

  const mockEm: any = {
    findOne: vi.fn(),
    create: vi.fn((_: unknown, payload: unknown) => payload),
    persistAndFlush: vi.fn(),
    find: vi.fn(),
    assign: vi.fn(),
    flush: vi.fn(),
    findOneOrFail: vi.fn(),
    getConnection: vi.fn(() => mockConnection),
    fork: vi.fn(),
    transactional: vi.fn(async (cb: any) => cb({ getConnection: () => mockTxConnection })),
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
    (service as any).em = mockEm;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects incomplete tenant creation contracts', async () => {
    await expect(
      service.createTenant({
        id: 'tenant-missing-contract',
        mode: TenantMode.SHARED,
      } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should return config from DB if not in cache', async () => {
    const mockTenant = { id: 't1', mode: TenantMode.SHARED };
    mockEm.findOne.mockResolvedValue(mockTenant);

    const config = await service.getTenantConfig('t1');
    expect(config.tenantId).toBe('t1');
    expect(config.mode).toBe(TenantMode.SHARED);
  });

  it('purges shared-tenant rows using parameterized tenant predicate', async () => {
    mockEm.findOneOrFail.mockResolvedValue({ status: TenantStatus.ARCHIVED });
    vi.spyOn(service, 'getTenantConfig').mockResolvedValue({ tenantId: 't1', mode: TenantMode.SHARED, settings: {} } as any);

    execute.mockResolvedValue([{ table_name: 'orders' }]);

    await service.purgeTenant('t1');

    expect(mockEm.findOneOrFail).toHaveBeenCalledWith(TenantControlRecord, { tenantId: 't1' });
    expect(txExecute).toHaveBeenCalledWith('DELETE FROM "orders" WHERE tenant_id = ?', ['t1']);
  });

  it('rejects unsafe schema identifiers during purge', async () => {
    mockEm.findOneOrFail.mockResolvedValue({ status: TenantStatus.ARCHIVED });
    vi.spyOn(service, 'getTenantConfig').mockResolvedValue({
      tenantId: 't1',
      mode: TenantMode.SCHEMA,
      schemaName: 'bad-schema;drop',
      settings: {},
    } as any);

    await expect(service.purgeTenant('t1')).rejects.toBeInstanceOf(ConflictException);
  });
});
