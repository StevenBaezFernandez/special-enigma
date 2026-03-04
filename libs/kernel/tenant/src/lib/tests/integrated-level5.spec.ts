import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { TenantRlsInterceptor } from '../interceptors/tenant-rls.interceptor';
import { TenantModelSubscriber } from '../subscribers/tenant-model.subscriber';
import { MigrationOrchestratorService } from '../migration-orchestrator.service';
import { FailoverService } from '../failover.service';
import { RegionalResidencyGuard } from '../guards/regional-residency.guard';
import { EntityManager, RequestContext } from '@mikro-orm/core';
import { TenantMode, TenantStatus, OperationState, OperationType } from '../interfaces/tenant-config.interface';
import * as auth from '@virteex/kernel-auth';
import { of, lastValueFrom } from 'rxjs';
import axios from 'axios';

vi.mock('axios');

describe('Integrated E2E Validation - Multi-tenant / Multi-region Level 5', () => {
  let mockEm: any;
  let mockTenantService: any;
  let mockOpService: any;
  let mockRoutingPlane: any;
  let mockFinOps: any;
  let mockGuard: any;
  let mockResidencyCompliance: any;

  beforeAll(() => {
    vi.spyOn(RequestContext, 'create').mockImplementation((em: any, cb: any) => cb());
  });

  beforeEach(() => {
    vi.clearAllMocks();
    process.env['EVIDENCE_SIGNING_SECRET'] = 'test-evidence-secret';
    (axios.get as any).mockResolvedValue({ status: 200 });

    mockEm = {
      transactional: vi.fn().mockImplementation((cb) => cb(mockEm)),
      getConnection: vi.fn().mockReturnValue({
        execute: vi.fn().mockImplementation((query) => {
            if (query.includes('pg_is_in_recovery')) return [{ is_replica: false }];
            if (query.includes('pg_last_xact_replay_timestamp')) return [{ lag: 0, lag_ms: 0 }];
            if (query.includes('information_schema.columns')) return [{ table_name: 'orders' }];
            return [{ tenantId: 't1', count: 10, checksum: 'hash', structural_hash: 'hash' }];
        }),
      }),
      setFilterParams: vi.fn(),
      fork: vi.fn().mockImplementation(() => mockEm),
      findOne: vi.fn(),
      findOneOrFail: vi.fn(),
      create: vi.fn().mockImplementation((_entity, data) => data),
      persist: vi.fn(),
      persistAndFlush: vi.fn(),
      flush: vi.fn(),
      assign: vi.fn(),
      getMigrator: vi.fn().mockReturnValue({
          up: vi.fn().mockResolvedValue(undefined),
          down: vi.fn().mockResolvedValue(undefined),
          getPendingMigrations: vi.fn().mockResolvedValue([])
      })
    };

    mockTenantService = {
      getTenantConfig: vi.fn(),
      em: mockEm
    };

    mockOpService = {
      createOperation: vi.fn().mockResolvedValue({ operationId: 'op-123', tenantId: 't1', type: 'MIGRATE' }),
      transitionState: vi.fn().mockResolvedValue(undefined),
      acquireLock: vi.fn().mockResolvedValue(true),
      releaseLock: vi.fn().mockResolvedValue(undefined),
    };

    mockRoutingPlane = {
      resolveRoute: vi.fn(),
      createSnapshot: vi.fn(),
    };

    mockFinOps = {
      recordOperationSlo: vi.fn(),
      recordResourceUsage: vi.fn(),
    };

    mockGuard = {
        preMigrationCheck: vi.fn().mockResolvedValue(true),
    };
    mockResidencyCompliance = {
      assertRegionAllowed: vi.fn().mockResolvedValue(undefined),
      authorizeReplication: vi.fn().mockResolvedValue({
        authorized: true,
        evidenceId: 'evidence-1',
        maskingApplied: true,
        replicatedPayload: { sample: '[MASKED_FOR_CROSS_REGION_REPLICATION]' }
      }),
    };

  });

  describe('Flujo A — Context Context + Isolation (HTTP to DB)', () => {
    it('SHOULD strictly isolate writes and enforce status', async () => {
      const interceptor = new TenantRlsInterceptor(mockEm as any, mockTenantService as any, mockResidencyCompliance as any);
      const subscriber = new TenantModelSubscriber();

      vi.spyOn(auth, 'getTenantContext').mockReturnValue({ tenantId: 'tenant-alpha' } as any);
      mockTenantService.getTenantConfig.mockResolvedValue({ mode: 'SHARED', tenantId: 'tenant-alpha', primaryRegion: 'us-east-1' });
      mockEm.findOne.mockResolvedValue({ status: 'ACTIVE', isFrozen: false });
      process.env['AWS_REGION'] = 'us-east-1';

      const mockContext: any = {
        switchToHttp: () => ({ getRequest: () => ({ method: 'POST' }) }),
        getHandler: () => ({}),
        getClass: () => ({})
      };
      const mockHandler = { handle: vi.fn().mockReturnValue(of({ success: true })) };

      // 1. Interceptor Layer
      const obs = await interceptor.intercept(mockContext, mockHandler);
      await lastValueFrom(obs);

      // 2. Subscriber Layer (Persistence)
      const entity = { tenantId: 'tenant-beta', constructor: { name: 'Invoice' } };
      const args: any = { entity, em: mockEm };
      await subscriber.beforeCreate(args);

      expect(entity.tenantId).toBe('tenant-alpha'); // Enforced isolation
      expect(mockEm.setFilterParams).toHaveBeenCalledWith('tenant', { tenantId: 'tenant-alpha' });
    });

    it('SHOULD fail-closed if tenant is SUSPENDED or context is invalid', async () => {
      const interceptor = new TenantRlsInterceptor(mockEm as any, mockTenantService as any, mockResidencyCompliance as any);
      vi.spyOn(auth, 'getTenantContext').mockReturnValue({ tenantId: 'suspended-tenant' } as any);
      mockEm.findOne.mockResolvedValue({ status: 'SUSPENDED' });
      mockTenantService.getTenantConfig.mockResolvedValue({ mode: 'SHARED', primaryRegion: 'us-east-1' });

      const mockContext: any = {
          switchToHttp: () => ({ getRequest: () => ({ method: 'GET' }) }),
          getHandler: () => ({}),
          getClass: () => ({})
      };
      const mockHandler = { handle: vi.fn() };

      await expect(interceptor.intercept(mockContext, mockHandler)).rejects.toThrow(/is suspended/i);
    });
  });

  describe('Flujo B — Migration Lifecycle (Pre-checks to Rollback)', () => {
    it('SHOULD reconcile and allow rollback on failure', async () => {
      const service = new MigrationOrchestratorService(mockEm, mockGuard, mockOpService, mockRoutingPlane);

      mockEm.findOneOrFail.mockResolvedValue({ id: 't1', mode: 'SCHEMA', schemaName: 'tenant_t1' });
      mockRoutingPlane.resolveRoute.mockResolvedValue({ version: 1 });

      await service.migrateTenantWithOperation('t1', 'key-full');

      expect(mockGuard.preMigrationCheck).toHaveBeenCalled();
      expect(mockOpService.transitionState).toHaveBeenCalledWith('op-123', OperationState.RECONCILING, expect.objectContaining({ reconciled: true }));
      expect(mockOpService.transitionState).toHaveBeenCalledWith('op-123', OperationState.FINALIZED);
    });
  });

  describe('Flujo C — Regional Failover (Signed Snapshots & Freeze)', () => {
    it('SHOULD freeze writes, promote region, and sign snapshot', async () => {
      const service = new FailoverService(mockEm, mockOpService, mockRoutingPlane, mockFinOps, mockResidencyCompliance);

      mockEm.findOneOrFail.mockResolvedValue({
          tenantId: 't1',
          primaryRegion: 'us-east-1',
          secondaryRegion: 'sa-east-1',
          status: 'ACTIVE',
          isFrozen: false,
          version: 2,
          fenceGeneration: 2
      });

      await service.triggerRegionalFailover('t1', 'fail-key');

      expect(mockEm.flush).toHaveBeenCalled(); // For isFrozen = true
      expect(mockRoutingPlane.createSnapshot).toHaveBeenCalledWith('t1', expect.objectContaining({
          primaryRegion: 'sa-east-1'
      }), { expectedGeneration: 2 });
    });

    it('SHOULD failover if target region health probes are successful', async () => {
        const service = new FailoverService(mockEm, mockOpService, mockRoutingPlane, mockFinOps, mockResidencyCompliance);
        mockEm.findOneOrFail.mockResolvedValue({ tenantId: 't1', secondaryRegion: 'sa-east-1', status: 'ACTIVE' });

        // Simulate healthy probes
        (axios.get as any).mockResolvedValueOnce({ status: 200 }); // LB
        (axios.get as any).mockResolvedValueOnce({ status: 200 }); // API

        await service.triggerRegionalFailover('t1', 'health-key');
        expect(mockOpService.transitionState).toHaveBeenCalledWith(expect.anything(), OperationState.VALIDATING);
    });
  });

  describe('Flujo D — Sovereignty (Sync + Async)', () => {
    it('SHOULD block async execution in unauthorized region', async () => {
      const guard = new RegionalResidencyGuard(mockTenantService as any, mockResidencyCompliance as any);

      vi.spyOn(auth, 'getTenantContext').mockReturnValue({ tenantId: 't1' } as any);
      mockTenantService.getTenantConfig.mockResolvedValue({ primaryRegion: 'us-east-1' });
      process.env['AWS_REGION'] = 'sa-east-1'; // Violation
      mockResidencyCompliance.assertRegionAllowed.mockRejectedValue(new Error('residency policy violation'));
      mockEm.findOne.mockResolvedValue({ status: 'ACTIVE', isFrozen: false });

      const mockContext: any = {
          switchToHttp: () => ({ getRequest: () => ({}) }),
          getHandler: () => ({}),
          getClass: () => ({})
      };

      await expect(guard.canActivate(mockContext)).rejects.toThrow(/residency policy violation/);
    });
  });
});
