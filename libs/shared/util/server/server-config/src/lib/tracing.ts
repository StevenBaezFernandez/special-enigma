import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { KafkaJsInstrumentation } from '@opentelemetry/instrumentation-kafkajs';
import { Logger } from '@nestjs/common';

export function createOtelSdk(serviceName: string): NodeSDK {
  const otelSDK = new NodeSDK({
    resource: resourceFromAttributes({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
    traceExporter: new OTLPTraceExporter({
      url: process.env['OTEL_EXPORTER_OTLP_ENDPOINT'] || 'http://localhost:4318/v1/traces',
    }),
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new NestInstrumentation(),
      new KafkaJsInstrumentation({}),
    ],
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    otelSDK
      .shutdown()
      .then(
        () => Logger.log('SDK shut down successfully', 'Tracing'),
        (err) => Logger.error('Error shutting down SDK', err, 'Tracing')
      )
      .finally(() => process.exit(0));
  });

  return otelSDK;
}
