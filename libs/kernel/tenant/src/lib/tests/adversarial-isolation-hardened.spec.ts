import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { TenantRlsInterceptor } from '../interceptors/tenant-rls.interceptor';
import { RegionalResidencyGuard } from '../guards/regional-residency.guard';
import { EntityManager, RequestContext } from '@mikro-orm/core';
import { TenantService } from '../tenant.service';
import { ForbiddenException } from '@nestjs/common';
import { of, from, lastValueFrom } from 'rxjs';
import * as TenantContextLib from '@virteex/kernel-tenant-context';
import { TenantModelSubscriber } from '../subscribers/tenant-model.subscriber';
import { TenantStatus } from '../interfaces/tenant-config.interface';

describe('Hardened Adversarial Isolation Tests (Level 5 Certification)', () => {
  let interceptor: TenantRlsInterceptor;
  let mockEm: any;
  let mockTenantService: any;
  let mockHandler: any;
  let mockResidencyCompliance: any;

  beforeAll(() => {
    vi.spyOn(RequestContext, 'create').mockImplementation((em: any, cb: any) => cb());
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockEm = {
      transactional: vi.fn().mockImplementation((cb) => cb(mockEm)),
      getConnection: vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue([{ tenant: 't1' }]),
      }),
      setFilterParams: vi.fn(),
      fork: vi.fn().mockImplementation(() => mockEm),
      findOne: vi.fn().mockResolvedValue({ isFrozen: false, status: 'ACTIVE' }),
      create: vi.fn().mockImplementation((_entity, data) => data),
      persist: vi.fn(),
      flush: vi.fn(),
      assign: vi.fn(),
    };
    mockTenantService = {
      getTenantConfig: vi.fn(),
      em: mockEm
    };
    mockHandler = {
      handle: vi.fn().mockReturnValue(of({ data: 'secret' })),
    };
    mockResidencyCompliance = {
      assertRegionAllowed: vi.fn().mockResolvedValue(undefined),
      authorizeReplication: vi.fn().mockResolvedValue({ authorized: true, evidenceId: 'e1', maskingApplied: true, replicatedPayload: {} }),
    };
    interceptor = new TenantRlsInterceptor(mockEm as any, mockTenantService as any, mockResidencyCompliance as any);
  });

  describe('Sync Path (HTTP Interceptor)', () => {
    it('SHOULD REJECT context without mandatory Level 5 claims (version/exp)', async () => {
      vi.spyOn(TenantContextLib, 'getTenantContext').mockReturnValue({ tenantId: 't1' } as any);
      const mockContext: any = {
        switchToHttp: () => ({ getRequest: () => ({ method: 'GET' }) }),
        getHandler: () => ({}),
        getClass: () => ({})
      };

      await expect(interceptor.intercept(mockContext, mockHandler)).rejects.toThrow(/integrity cannot be verified/i);
    });

    it('SHOULD FAIL-CLOSED if tenant control record is missing', async () => {
      vi.spyOn(TenantContextLib, 'getTenantContext').mockReturnValue({
        tenantId: 't1',
        contextVersion: 'v1',
        exp: Math.floor(Date.now() / 1000) + 3600
      } as any);
      mockEm.findOne.mockResolvedValue(null); // Missing control record

      const mockContext: any = {
        switchToHttp: () => ({ getRequest: () => ({ method: 'GET' }) }),
        getHandler: () => ({}),
        getClass: () => ({})
      };

      await expect(interceptor.intercept(mockContext, mockHandler)).rejects.toThrow(/Tenant is currently unavailable/i || /Access denied/i);
    });
  });

  describe('Async Path (Regional Guard)', () => {
    it('SHOULD BLOCK async execution if AWS_REGION is missing in production', async () => {
        const guard = new RegionalResidencyGuard(mockTenantService as any, mockResidencyCompliance as any);
        vi.spyOn(TenantContextLib, 'getTenantContext').mockReturnValue({ tenantId: 't1' } as any);

        process.env['NODE_ENV'] = 'production';
        delete process.env['AWS_REGION'];

        const mockContext: any = {
            switchToHttp: () => ({ getRequest: () => ({}) }),
            getHandler: () => ({}),
            getClass: () => ({})
        };

        await expect(guard.canActivate(mockContext)).rejects.toThrow(/Regional context missing/i);
    });

    it('SHOULD ENFORCE strict status check for async jobs (Blocking SUSPENDED)', async () => {
        mockTenantService.em = mockEm;
        const guard = new RegionalResidencyGuard(mockTenantService as any, mockResidencyCompliance as any);
        vi.spyOn(TenantContextLib, 'getTenantContext').mockReturnValue({ tenantId: 't1' } as any);

        mockEm.findOne.mockResolvedValue({ status: TenantStatus.SUSPENDED, isFrozen: false });
        process.env['AWS_REGION'] = 'us-east-1';

        const mockContext: any = {
            switchToHttp: () => ({ getRequest: () => ({}) }),
            getHandler: () => ({}),
            getClass: () => ({})
        };

        await expect(guard.canActivate(mockContext)).rejects.toThrow(/Tenant is suspended/i);
    });
  });

  describe('Persistence Path (Subscriber)', () => {
    it('SHOULD PREVENT tenant-id mutation on existing entities', async () => {
        const subscriber = new TenantModelSubscriber();
        vi.spyOn(TenantContextLib, 'getTenantContext').mockReturnValue({
            tenantId: 'tenant-a',
            contextVersion: 'v1',
            exp: Math.floor(Date.now() / 1000) + 3600
        } as any);

        const entity = { tenantId: 'tenant-b', constructor: { name: 'Order' } };
        const args: any = {
            entity,
            em: {
                findOne: vi.fn().mockResolvedValue({ isFrozen: false, status: 'ACTIVE' }),
                getConnection: vi.fn().mockReturnValue({ execute: vi.fn() })
            }
        };

        await expect(subscriber.beforeUpdate(args)).rejects.toThrow(/Cross-tenant write operation blocked/i);
    });

    it('SHOULD LOG and AUDIT any cross-tenant bypass attempt to the security journal', async () => {
        const subscriber = new TenantModelSubscriber();
        const executeSpy = vi.fn();
        vi.spyOn(TenantContextLib, 'getTenantContext').mockReturnValue({
            tenantId: 'attacker',
            contextVersion: 'v1',
            exp: Math.floor(Date.now() / 1000) + 3600
        } as any);

        const entity = { tenantId: 'victim', constructor: { name: 'Profile' } };
        const args: any = {
            entity,
            em: {
                findOne: vi.fn().mockResolvedValue({ isFrozen: false, status: 'ACTIVE' }),
                getConnection: vi.fn().mockReturnValue({ execute: executeSpy })
            }
        };

        await expect(subscriber.beforeUpdate(args)).rejects.toThrow();
        expect(executeSpy).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO security_audit_journal'),
            expect.arrayContaining(['attacker', 'CROSS_TENANT_WRITE_ATTEMPT'])
        );
    });
  });
});
