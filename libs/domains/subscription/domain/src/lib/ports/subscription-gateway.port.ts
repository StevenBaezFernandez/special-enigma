export const SUBSCRIPTION_GATEWAY = 'SUBSCRIPTION_GATEWAY';

export interface CreateSubscriptionResult {
  subscriptionId: string;
  customerId: string;
  clientSecret: string;
  status: string;
  currentPeriodEnd: Date;
}

export interface SubscriptionGateway {
  createCustomer(email: string, name: string, paymentMethodId: string): Promise<string>;
  createSubscription(customerId: string, priceId: string): Promise<CreateSubscriptionResult>;
  updateSubscription(subscriptionId: string, priceId: string): Promise<CreateSubscriptionResult>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  createPortalSession(customerId: string, returnUrl: string): Promise<string>;
  createCheckoutSession(priceId: string, customerId: string, successUrl: string, cancelUrl: string, clientReferenceId?: string, metadata?: Record<string, string>): Promise<string>;
}
