import { describe, it, expect } from 'vitest';
import { Subscription, SubscriptionStatus } from './subscription.entity';
import { SubscriptionPlan } from './subscription-plan.entity';

describe('Subscription Entity', () => {
  const mockPlan = { id: 'plan-1' } as SubscriptionPlan;

  it('should create a subscription with default values', () => {
    const sub = new Subscription('tenant-1', mockPlan);
    expect(sub.tenantId).toBe('tenant-1');
    expect(sub.plan).toBe(mockPlan);
    expect(sub.status).toBe(SubscriptionStatus.ACTIVE);
    expect(sub.cancelAtPeriodEnd).toBe(false);
  });

  it('should mark as active correctly', () => {
    const sub = new Subscription('tenant-1', mockPlan);
    const endDate = new Date();
    sub.markAsActive('ext-sub-1', endDate);

    expect(sub.status).toBe(SubscriptionStatus.ACTIVE);
    expect(sub.externalSubscriptionId).toBe('ext-sub-1');
    expect(sub.currentPeriodEnd).toBe(endDate);
    expect(sub.endDate).toBe(endDate);
  });

  it('should mark as canceled correctly (at period end)', () => {
    const sub = new Subscription('tenant-1', mockPlan);
    sub.markAsCanceled(true);

    expect(sub.status).toBe(SubscriptionStatus.ACTIVE);
    expect(sub.cancelAtPeriodEnd).toBe(true);
  });

  it('should mark as canceled correctly (immediately)', () => {
    const sub = new Subscription('tenant-1', mockPlan);
    sub.markAsCanceled(false);

    expect(sub.status).toBe(SubscriptionStatus.CANCELED);
    expect(sub.cancelAtPeriodEnd).toBe(false);
    expect(sub.endDate).toBeDefined();
  });

  it('should validate correctly', () => {
    const sub = new Subscription('tenant-1', mockPlan);
    expect(sub.isValid()).toBe(true);

    sub.status = SubscriptionStatus.EXPIRED;
    expect(sub.isValid()).toBe(false);
  });
});
