export interface ITelemetryService {
  recordSecurityEvent(eventName: string, details: Record<string, unknown>): void;
  recordBusinessMetric(name: string, value: number, attributes?: Record<string, string | number | boolean>): void;
  recordInvoiceEmitted(country: string, status: string): void;
  recordPaymentProcessed(amount: number, currency: string, success: boolean): void;
  setTraceAttributes(attributes: Record<string, string | number | boolean>): void;
}
