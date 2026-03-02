import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { TenantRlsInterceptor } from './tenant-rls.interceptor';
import { EntityManager, RequestContext } from '@mikro-orm/core';
import { TenantService } from '../tenant.service';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, lastValueFrom } from 'rxjs';
import * as AuthModule from '@virteex/kernel-auth';

vi.mock('@virteex/kernel-auth');

describe('TenantRlsInterceptor', () => {
  let interceptor: TenantRlsInterceptor;
  let em: EntityManager;

  beforeAll(() => {
    vi.spyOn(RequestContext, 'create').mockImplementation(async (em, cb) => {
      return cb();
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
  let tenantService: TenantService;

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

  it('should FAIL if no tenant context (even for GET)', async () => {
    (AuthModule.getTenantContext as jest.Mock).mockReturnValue(null);
    const next = { handle: vi.fn().mockReturnValue(of('test')) };
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ method: 'GET' }) })
    } as unknown as ExecutionContext;

    await expect(interceptor.intercept(context, next as unknown as CallHandler)).rejects.toThrow('Tenant context is required for all operations');
  });

  it('should use transaction for SHARED mode', async () => {
    (AuthModule.getTenantContext as jest.Mock).mockReturnValue({ tenantId: 't1' });
    (tenantService.getTenantConfig as jest.Mock).mockResolvedValue({ mode: 'SHARED' });

    const next = { handle: vi.fn().mockReturnValue(of('result')) };
    const context = {} as ExecutionContext;

    // Mock transactional to execute callback
    (em.transactional as jest.Mock).mockImplementation(async (cb) => {
      return cb(em);
    });

    const result = await interceptor.intercept(context, next as unknown as CallHandler);
    const obs = await result;
    const value = await lastValueFrom(obs);

    expect(value).toBe('result');
    expect(em.transactional).toHaveBeenCalled();
    expect(em.getConnection().execute).toHaveBeenCalledWith('SET LOCAL app.current_tenant = ?', ['t1']);
  });

  it('should NOT use transaction for SCHEMA mode', async () => {
    (AuthModule.getTenantContext as jest.Mock).mockReturnValue({ tenantId: 't2' });
    (tenantService.getTenantConfig as jest.Mock).mockResolvedValue({ mode: 'SCHEMA' });

    const next = { handle: vi.fn().mockReturnValue(of('result')) };
    const context = {} as ExecutionContext;

    const result = await interceptor.intercept(context, next as unknown as CallHandler);
    const obs = await result;
    const value = await lastValueFrom(obs);

    expect(value).toBe('result');
    expect(em.transactional).not.toHaveBeenCalled();
    expect(em.getConnection).not.toHaveBeenCalled();
  });

  it('should fail closed for write operations without tenant context', async () => {
    (AuthModule.getTenantContext as jest.Mock).mockReturnValue(null);
    const next = { handle: vi.fn().mockReturnValue(of('test')) };
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ method: 'POST' }) })
    } as unknown as ExecutionContext;

    await expect(interceptor.intercept(context, next as unknown as CallHandler)).rejects.toThrow('Tenant context is required for all operations');
  });
});
