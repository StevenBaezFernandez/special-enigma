import { vi, describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { TenantRlsInterceptor } from './tenant-rls.interceptor';
import { EntityManager, RequestContext } from '@mikro-orm/core';
import { TenantService } from '../tenant.service';
import { ResidencyComplianceService } from '../residency-compliance.service';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, lastValueFrom } from 'rxjs';
import * as TenantContextLib from '@virteex/kernel-tenant-context';

vi.mock('@virteex/kernel-tenant-context', () => ({
    getTenantContext: vi.fn(),
}));

describe('TenantRlsInterceptor', () => {
  let interceptor: TenantRlsInterceptor;
  let em: EntityManager;
  let tenantService: TenantService;

  beforeAll(() => {
    vi.spyOn(RequestContext, 'create').mockImplementation((em: any, cb: any) => {
      return cb();
    });
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantRlsInterceptor,
        {
            provide: ResidencyComplianceService,
            useValue: { assertRegionAllowed: vi.fn().mockResolvedValue(undefined) }
        },
        {
          provide: EntityManager,
          useValue: {
            transactional: vi.fn(),
            getConnection: vi.fn().mockReturnValue({ execute: vi.fn() }),
            setFilterParams: vi.fn(),
            findOne: vi.fn().mockResolvedValue({ status: 'ACTIVE', isFrozen: false }),
          },
        },
        {
          provide: TenantService,
          useValue: {
            getTenantConfig: vi.fn(),
          },
        },
      ],
    }).compile();

    interceptor = module.get<TenantRlsInterceptor>(TenantRlsInterceptor);
    em = module.get<EntityManager>(EntityManager);
    tenantService = module.get<TenantService>(TenantService);

    (interceptor as any).tenantService = tenantService;
    (interceptor as any).em = em;
    (interceptor as any).residencyComplianceService = module.get(ResidencyComplianceService);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should use transaction for SHARED mode', async () => {
    (TenantContextLib.getTenantContext as any).mockReturnValue({ tenantId: 't1', contextVersion: 'v1', exp: Math.floor(Date.now() / 1000) + 3600 });
    (tenantService.getTenantConfig as any).mockResolvedValue({
        mode: 'SHARED',
        tenantId: 't1',
        primaryRegion: 'us-east-1'
    });
    process.env['AWS_REGION'] = 'us-east-1';

    const next = { handle: vi.fn().mockReturnValue(of('result')) };
    const context = {
        switchToHttp: () => ({ getRequest: () => ({ method: 'GET' }) })
    } as any as ExecutionContext;

    (em.transactional as any).mockImplementation(async (cb: any) => {
      return cb(em);
    });

    const obs = await interceptor.intercept(context, next as unknown as CallHandler);
    const value = await lastValueFrom(obs);

    expect(value).toBe('result');
    expect(em.transactional).toHaveBeenCalled();
  });
});
