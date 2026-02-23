export const PAYMENT_SESSION_PROVIDER = 'PAYMENT_SESSION_PROVIDER';

export interface PaymentSessionProvider {
  createPortalSession(customerId: string, returnUrl: string): Promise<string>;
  createCheckoutSession(
    priceId: string,
    customerId: string,
    successUrl: string,
    cancelUrl: string,
    clientReferenceId?: string,
    metadata?: Record<string, string>
  ): Promise<string>;
}
