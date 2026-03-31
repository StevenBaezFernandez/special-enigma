import { vi, describe, it, expect, beforeEach } from 'vitest';
import { EntitlementService } from './entitlement.service';
import { getTenantContext } from '@virteex/kernel-auth';

vi.mock('@virteex/kernel-auth', () => ({
  getTenantContext: vi.fn(),
}));

describe('EntitlementService', () => {
  let service: EntitlementService;
  let subscriptionRepository: any;

  beforeEach(() => {
    subscriptionRepository = {
      findByTenantId: vi.fn(),
    };
    service = new EntitlementService(subscriptionRepository);
  });

  it('should return false if no tenant context', async () => {
    (getTenantContext as any).mockReturnValue(null);
    const result = await service.isFeatureEnabled('any');
    expect(result).toBe(false);
  });

  it('should return true if feature is in plan', async () => {
    (getTenantContext as any).mockReturnValue({ tenantId: 't1' });
    subscriptionRepository.findByTenantId.mockResolvedValue({
      isValid: () => true,
      getPlan: () => ({ features: ['f1'] }),
    });
    const result = await service.isFeatureEnabled('f1');
    expect(result).toBe(true);
  });

  it('should throw if quota exceeded', async () => {
    (getTenantContext as any).mockReturnValue({ tenantId: 't1' });
    subscriptionRepository.findByTenantId.mockResolvedValue({
      isValid: () => true,
      getPlan: () => ({ limits: { users: 5 } }),
    });
    await expect(service.checkQuota('users', 5)).rejects.toThrow('Quota exceeded');
  });
});
