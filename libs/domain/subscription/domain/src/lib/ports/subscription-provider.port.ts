import { SubscriptionStatus } from '../entities/subscription.entity';

export const SUBSCRIPTION_PROVIDER_GATEWAY = 'SUBSCRIPTION_PROVIDER_GATEWAY';

export interface SubscriptionProviderResult {
  subscriptionId: string;
  customerId: string;
  clientSecret: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
}

export interface SubscriptionProviderGateway {
  createSubscription(customerId: string, priceId: string): Promise<SubscriptionProviderResult>;
  updateSubscription(subscriptionId: string, priceId: string): Promise<SubscriptionProviderResult>;
  cancelSubscription(subscriptionId: string): Promise<void>;
}
