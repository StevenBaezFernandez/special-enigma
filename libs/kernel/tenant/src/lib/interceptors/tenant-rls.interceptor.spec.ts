import { vi, describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { TenantRlsInterceptor } from './tenant-rls.interceptor';
import { EntityManager, RequestContext } from '@mikro-orm/core';
import { TenantService } from '../tenant.service';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, lastValueFrom } from 'rxjs';
import * as AuthModule from '@virteex/kernel-auth';

vi.mock('@virteex/kernel-auth', () => ({
    getTenantContext: vi.fn()
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
          provide: EntityManager,
          useValue: {
            transactional: vi.fn(),
            getConnection: vi.fn().mockReturnValue({ execute: vi.fn() }),
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
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should use transaction for SHARED mode', async () => {
    (AuthModule.getTenantContext as any).mockReturnValue({ tenantId: 't1' });
    (tenantService.getTenantConfig as any).mockResolvedValue({ mode: 'SHARED', tenantId: 't1' });

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
