import { describe, it, expect } from 'vitest';
import { StripeMapper } from './stripe.mapper';
import { SubscriptionStatus } from '@virteex/subscription-domain';

describe('StripeMapper', () => {
  describe('toSubscriptionStatus', () => {
    it('should map active correctly', () => {
      expect(StripeMapper.toSubscriptionStatus('active')).toBe(SubscriptionStatus.ACTIVE);
    });

    it('should map past_due correctly', () => {
      expect(StripeMapper.toSubscriptionStatus('past_due')).toBe(SubscriptionStatus.PAST_DUE);
    });

    it('should map canceled correctly', () => {
      expect(StripeMapper.toSubscriptionStatus('canceled')).toBe(SubscriptionStatus.CANCELED);
    });

    it('should map trialing correctly', () => {
      expect(StripeMapper.toSubscriptionStatus('trialing')).toBe(SubscriptionStatus.TRIAL);
    });

    it('should map unpaid correctly', () => {
      expect(StripeMapper.toSubscriptionStatus('unpaid')).toBe(SubscriptionStatus.EXPIRED);
    });

    it('should return ACTIVE for unknown status', () => {
      expect(StripeMapper.toSubscriptionStatus('unknown')).toBe(SubscriptionStatus.ACTIVE);
    });
  });

  describe('toDomainDate', () => {
    it('should convert timestamp to Date object', () => {
      const timestamp = 1672531200; // 2023-01-01 00:00:00 UTC
      const date = StripeMapper.toDomainDate(timestamp);
      expect(date.getTime()).toBe(timestamp * 1000);
    });
  });
});
