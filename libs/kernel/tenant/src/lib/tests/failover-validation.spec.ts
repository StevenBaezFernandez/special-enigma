import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FailoverService } from '../failover.service';
import { OperationState, TenantStatus } from '../interfaces/tenant-config.interface';
import axios from 'axios';

vi.mock('axios');

describe('Regional Failover Operational Validation', () => {
  let service: FailoverService;
  let mockEm: any;
  let mockOpService: any;
  let mockRoutingPlane: any;
  let mockResidencyCompliance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env['EVIDENCE_SIGNING_SECRET'] = 'test-evidence-secret';
    (axios.get as any).mockResolvedValue({ status: 200 });

    mockEm = {
      findOneOrFail: vi.fn(),
      flush: vi.fn().mockResolvedValue(undefined),
      getConnection: vi.fn().mockReturnValue({
          execute: vi.fn().mockResolvedValue([{ rows: [1], is_replica: false, lag_ms: '0' }])
      }),
      fork: vi.fn().mockReturnValue({
          getConnection: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue([{ is_replica: false }])
          })
      })
    };
    mockOpService = {
      createOperation: vi.fn().mockResolvedValue({ operationId: 'fail-123' }),
      transitionState: vi.fn().mockResolvedValue(undefined),
      acquireLock: vi.fn().mockResolvedValue(true),
      releaseLock: vi.fn().mockResolvedValue(undefined),
    };
    mockRoutingPlane = {
      createSnapshot: vi.fn().mockResolvedValue({}),
      resolveRoute: vi.fn().mockResolvedValue({ version: 1 }),
    };
    const mockFinOps = {
      recordOperationSlo: vi.fn().mockResolvedValue(undefined),
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

    service = new FailoverService(mockEm as any, mockOpService as any, mockRoutingPlane as any, mockFinOps as any, mockResidencyCompliance as any);
  });

  it('SHOULD promote secondary region during failover', async () => {
    mockEm.findOneOrFail.mockResolvedValue({
      tenantId: 't1',
      primaryRegion: 'us-east-1',
      secondaryRegion: 'sa-east-1',
      status: TenantStatus.ACTIVE,
      version: 3,
      fenceGeneration: 3,
    });

    await service.triggerRegionalFailover('t1', 'key-1');

    expect(mockOpService.transitionState).toHaveBeenCalledWith('fail-123', OperationState.SWITCHED, expect.objectContaining({
        switchedTo: 'sa-east-1'
    }));
    expect(mockRoutingPlane.createSnapshot).toHaveBeenCalledWith('t1', expect.objectContaining({
      primaryRegion: 'sa-east-1',
      failoverActive: true
    }), { expectedGeneration: 3 });
    expect(mockOpService.transitionState).toHaveBeenCalledWith('fail-123', OperationState.FINALIZED, expect.any(Object));
  });

  it('SHOULD reject failover if already in degraded state', async () => {
    mockEm.findOneOrFail.mockResolvedValue({
      tenantId: 't1',
      status: TenantStatus.DEGRADED,
    });

    await expect(service.triggerRegionalFailover('t1', 'key-2')).rejects.toThrow(/already in failover state/);
  });

  it('SHOULD rollback failover operation if routing publish fails', async () => {
    mockEm.findOneOrFail.mockResolvedValue({
      tenantId: 't-fail',
      primaryRegion: 'us-east-1',
      secondaryRegion: 'sa-east-1',
      status: TenantStatus.ACTIVE,
      version: 3,
      fenceGeneration: 3,
    });
    mockRoutingPlane.createSnapshot.mockRejectedValue(new Error('KMS Failure'));

    await expect(service.triggerRegionalFailover('t-fail', 'key-3')).rejects.toThrow();

    expect(mockOpService.transitionState).toHaveBeenCalledWith('fail-123', OperationState.ROLLBACK, expect.any(Object));
  });
});
