import { SubscriptionStatus } from '@virteex/domain-subscription-domain';

export class StripeMapper {
  static toSubscriptionStatus(stripeStatus: string): SubscriptionStatus {
    const statusMap: Record<string, SubscriptionStatus> = {
      'active': SubscriptionStatus.ACTIVE,
      'past_due': SubscriptionStatus.PAST_DUE,
      'canceled': SubscriptionStatus.CANCELED,
      'trialing': SubscriptionStatus.TRIAL,
      'unpaid': SubscriptionStatus.EXPIRED,
      'incomplete': SubscriptionStatus.PAYMENT_PENDING,
      'incomplete_expired': SubscriptionStatus.EXPIRED,
      'paused': SubscriptionStatus.ACTIVE,
    };

    return statusMap[stripeStatus] || SubscriptionStatus.ACTIVE;
  }

  static toDomainDate(timestamp: number): Date {
    return new Date(timestamp * 1000);
  }
}
