export interface PaymentProvider {
  processPayment(amount: number, currency: string, source: string): Promise<{ success: boolean; transactionId: string }>;
}
