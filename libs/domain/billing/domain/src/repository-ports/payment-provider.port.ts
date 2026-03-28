export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';

export interface PaymentProvider {
  processPayment(amount: number, currency: string, source: string): Promise<any>;
}
