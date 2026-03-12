export abstract class TelemetryService {
  abstract recordSecurityEvent(eventName: string, details: Record<string, unknown>): void;
  abstract recordBusinessMetric(name: string, value: number, attributes?: Record<string, string | number | boolean>): void;
  abstract recordInvoiceEmitted(country: string, status: string): void;
  abstract recordPaymentProcessed(amount: number, currency: string, success: boolean): void;
  abstract setTraceAttributes(attributes: Record<string, string | number | boolean>): void;
}
export const TELEMETRY_SERVICE = Symbol('TELEMETRY_SERVICE');
