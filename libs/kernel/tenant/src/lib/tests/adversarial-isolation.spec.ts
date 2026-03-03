import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { TenantRlsInterceptor } from '../interceptors/tenant-rls.interceptor';
import { RegionalResidencyGuard } from '../guards/regional-residency.guard';
import { EntityManager, RequestContext } from '@mikro-orm/core';
import { TenantService } from '../tenant.service';
import { ForbiddenException } from '@nestjs/common';
import { of } from 'rxjs';
import * as auth from '@virteex/kernel-auth';
import { TenantModelSubscriber } from '../subscribers/tenant-model.subscriber';
import { RoutingPlaneService } from '../routing-plane.service';

describe('Adversarial Isolation Tests (Tenant Escape)', () => {
  let interceptor: TenantRlsInterceptor;
  let mockEm: any;
  let mockTenantService: any;
  let mockHandler: any;

  beforeAll(() => {
    vi.spyOn(RequestContext, 'create').mockImplementation((em: any, cb: any) => cb());
  });

  beforeEach(() => {
    mockEm = {
      transactional: vi.fn().mockImplementation((cb) => cb(mockEm)),
      getConnection: vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue(undefined),
      }),
      setFilterParams: vi.fn(),
      fork: vi.fn().mockImplementation(() => mockEm),
      findOne: vi.fn().mockResolvedValue({ isFrozen: false }),
      persist: vi.fn(),
      flush: vi.fn(),
      assign: vi.fn(),
    };
    mockTenantService = {
      getTenantConfig: vi.fn(),
    };
    mockHandler = {
      handle: vi.fn().mockReturnValue(of({ data: 'secret' })),
    };
    interceptor = new TenantRlsInterceptor(mockEm as any, mockTenantService as any);
  });

  it('SHOULD BLOCK access when tenant context is missing', async () => {
    vi.spyOn(auth, 'getTenantContext').mockReturnValue(null as any);
    const mockContext: any = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({ getRequest: () => ({ method: 'GET' }) })
    };

    await expect(interceptor.intercept(mockContext, mockHandler)).rejects.toThrow(ForbiddenException);
  });

  it('SHOULD FAIL CLOSED if RLS session context cannot be set', async () => {
    vi.spyOn(auth, 'getTenantContext').mockReturnValue({ tenantId: 't1' } as any);
    mockTenantService.getTenantConfig.mockResolvedValue({ mode: 'SHARED', primaryRegion: 'us-east-1' });
    process.env['AWS_REGION'] = 'us-east-1';
    mockEm.getConnection().execute.mockRejectedValue(new Error('DB Error'));

    const mockContext: any = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({ getRequest: () => ({ method: 'GET' }) })
    };
    const observable = await interceptor.intercept(mockContext, mockHandler);
    await expect(require('rxjs').lastValueFrom(observable)).rejects.toThrow(ForbiddenException);
  });

  it('SHOULD BLOCK access when region sovereignty is violated', async () => {
    vi.spyOn(auth, 'getTenantContext').mockReturnValue({ tenantId: 't1' } as any);
    mockTenantService.getTenantConfig.mockResolvedValue({
        mode: 'SHARED',
        settings: { allowedRegion: 'us-east-1' }
    });
    process.env['AWS_REGION'] = 'sa-east-1';

    const mockContext: any = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({ getRequest: () => ({ method: 'GET' }) })
    };
    await expect(interceptor.intercept(mockContext, mockHandler)).rejects.toThrow(ForbiddenException);
  });

  it('SHOULD FORK EntityManager for DATABASE mode to ensure physical isolation', async () => {
      vi.spyOn(auth, 'getTenantContext').mockReturnValue({ tenantId: 'tenant-enterprise' } as any);
      mockTenantService.getTenantConfig.mockResolvedValue({
          mode: 'DATABASE',
          primaryRegion: 'us-east-1',
          connectionString: 'postgresql://dedicated:5432/db'
      });
      process.env['AWS_REGION'] = 'us-east-1';

      const mockContext: any = {
          getHandler: () => ({}),
          getClass: () => ({}),
          switchToHttp: () => ({ getRequest: () => ({ method: 'GET' }) })
      };
      const observable = await interceptor.intercept(mockContext, mockHandler);

      const { lastValueFrom } = require('rxjs');
      await lastValueFrom(observable);

      expect(mockEm.fork).toHaveBeenCalledWith(expect.objectContaining({ connectionString: 'postgresql://dedicated:5432/db' }));
  });

  it('SHOULD BLOCK when HMAC signature is altered in Routing Plane', async () => {
      mockEm.create = vi.fn().mockImplementation((entity, data) => data);
      const routingService = new RoutingPlaneService(mockEm, mockTenantService, { get: () => 'secret' } as any);

      const snapshot = {
          tenantId: 't1',
          generation: 1,
          routeTargets: { mode: 'SHARED' },
          issuedAt: new Date(),
          signature: 'tampered-sig'
      };
      mockEm.findOne.mockResolvedValue(snapshot);
      mockTenantService.getTenantConfig.mockResolvedValue({ mode: 'SHARED', tenantId: 't1' });

      await routingService.resolveRoute('t1');
      // Should fall back to slow path (TenantService) because signature is invalid
      expect(mockTenantService.getTenantConfig).toHaveBeenCalled();
  });

  it('SHOULD NOT allow cross-tenant writes even if read filter is bypassed', async () => {
    const subscriber = new TenantModelSubscriber();
    vi.spyOn(auth, 'getTenantContext').mockReturnValue({ tenantId: 'tenant-real' } as any);

    const entity = { tenantId: 'tenant-target', constructor: { name: 'Order' } };
    const args: any = {
        entity,
        em: { findOne: vi.fn().mockResolvedValue({ isFrozen: false }) }
    };

    await subscriber.beforeCreate(args);

    // Subscriber MUST overwrite any attempted tenant ID with the one from context
    expect(entity.tenantId).toBe('tenant-real');
  });

  it('SHOULD enforce regional residency in Async channels via RegionalResidencyGuard', async () => {
    const guard = new RegionalResidencyGuard(mockTenantService as any);
    vi.spyOn(auth, 'getTenantContext').mockReturnValue({ tenantId: 't1' } as any);
    mockTenantService.getTenantConfig.mockResolvedValue({
        primaryRegion: 'us-east-1'
    });
    process.env['AWS_REGION'] = 'sa-east-1';

    const mockContext: any = {
        switchToHttp: () => ({ getRequest: () => ({}) }),
        getHandler: () => ({}),
        getClass: () => ({})
    };

    await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
  });

  it('SHOULD block Async tasks if tenant is frozen', async () => {
    // Inject mock EM into TenantService for the guard to find it
    mockTenantService.em = mockEm;
    const guard = new RegionalResidencyGuard(mockTenantService as any);
    vi.spyOn(auth, 'getTenantContext').mockReturnValue({ tenantId: 't-frozen' } as any);

    mockTenantService.getTenantConfig.mockResolvedValue({ primaryRegion: 'us-east-1' });
    mockEm.findOne.mockResolvedValue({ isFrozen: true });
    process.env['AWS_REGION'] = 'us-east-1';

    const mockContext: any = {
        switchToHttp: () => ({ getRequest: () => ({}) }),
        getHandler: () => ({}),
        getClass: () => ({})
    };

    await expect(guard.canActivate(mockContext)).rejects.toThrow(/is currently frozen/);
  });

  it('SHOULD FAIL CLOSED if context is missing during persistence', async () => {
    const subscriber = new TenantModelSubscriber();
    vi.spyOn(auth, 'getTenantContext').mockReturnValue(null as any);

    const entity = { tenantId: 'any', constructor: { name: 'Order' } };
    await expect(subscriber.beforeCreate({ entity } as any)).rejects.toThrow(/SECURITY VIOLATION/);
  });

  it('SHOULD BLOCK persistence if tenant is frozen', async () => {
      const subscriber = new TenantModelSubscriber();
      vi.spyOn(auth, 'getTenantContext').mockReturnValue({ tenantId: 't-frozen' } as any);

      const entity = { tenantId: 't-frozen', constructor: { name: 'Order' } };
      const args: any = {
          entity,
          em: { findOne: vi.fn().mockResolvedValue({ isFrozen: true }) }
      };

      await expect(subscriber.beforeCreate(args)).rejects.toThrow(/is currently frozen/);
  });

  it('SHOULD ALLOW persistence for Control Plane entities even if frozen', async () => {
      const subscriber = new TenantModelSubscriber();
      vi.spyOn(auth, 'getTenantContext').mockReturnValue({ tenantId: 't-frozen' } as any);

      const entity = { tenantId: 't-frozen', constructor: { name: 'TenantOperation' } };
      const args: any = {
          entity,
          em: { findOne: vi.fn().mockResolvedValue({ isFrozen: true }) }
      };

      await expect(subscriber.beforeCreate(args)).resolves.not.toThrow();
  });
});
