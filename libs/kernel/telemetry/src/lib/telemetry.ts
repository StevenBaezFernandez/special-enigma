import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ITelemetryService } from './telemetry.interface';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { ConsoleSpanExporter, SimpleSpanProcessor, BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { trace, context, Span, metrics, Meter, Attributes } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';

@Injectable()
export class TelemetryService implements ITelemetryService, OnModuleInit, OnModuleDestroy {
  private sdk: NodeSDK;
  private readonly logger = new Logger(TelemetryService.name);
  private meter: Meter;

  constructor() {
    this.meter = metrics.getMeter('virteex-business-metrics');
    let traceExporter;
    let spanProcessor;

    if (process.env['OTEL_EXPORTER_OTLP_ENDPOINT']) {
        traceExporter = new OTLPTraceExporter();
        spanProcessor = new BatchSpanProcessor(traceExporter);
    } else {
        traceExporter = new ConsoleSpanExporter();
        spanProcessor = new SimpleSpanProcessor(traceExporter);
    }

    this.sdk = new NodeSDK({
      resource: resourceFromAttributes({
        [SemanticResourceAttributes.SERVICE_NAME]: process.env['SERVICE_NAME'] || 'virteex-service',
        'tenant.mode': process.env['TENANT_MODE'] || 'unknown',
        'region': process.env['AWS_REGION'] || 'unknown',
      }),
      spanProcessor,
      instrumentations: [
        new HttpInstrumentation(),
        new ExpressInstrumentation(),
        new NestInstrumentation(),
      ],
    });
  }

  onModuleInit() {
    this.sdk.start();
    this.logger.log('Telemetry SDK started');
  }

  async onModuleDestroy() {
    try {
      await this.sdk.shutdown();
      this.logger.log('Telemetry SDK shut down');
    } catch (err) {
      this.logger.error('Error shutting down Telemetry SDK', err);
    }
  }

  getTracer(name = 'virteex-kernel') {
    return trace.getTracer(name);
  }

  getActiveSpan(): Span | undefined {
    return trace.getSpan(context.active());
  }

  setTraceAttributes(attributes: Record<string, string | number | boolean>) {
    const span = this.getActiveSpan();
    if (span) {
      span.setAttributes(attributes);
    }
  }

  recordSecurityEvent(eventName: string, details: Record<string, unknown>) {
    const span = this.getActiveSpan();
    if (span) {
      span.addEvent(eventName, details as Attributes);
    }
    this.logger.warn(`[SECURITY] ${eventName}`, details);
    this.recordBusinessMetric('security_events_total', 1, { event: eventName });
  }

  recordBusinessMetric(name: string, value: number, attributes: Record<string, string | number | boolean> = {}) {
    const counter = this.meter.createCounter(name);
    counter.add(value, attributes);
    this.logger.log(`[METRIC] ${name}: ${value}`, attributes);
  }

  recordInvoiceEmitted(country: string, status: string) {
    this.recordBusinessMetric('invoices_emitted_total', 1, { country, status });
  }

  recordPaymentProcessed(amount: number, currency: string, success: boolean) {
    this.recordBusinessMetric('payments_processed_total', 1, { currency, success: String(success) });
  }
}
