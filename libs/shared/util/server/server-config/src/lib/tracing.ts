import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { KafkaJsInstrumentation } from '@opentelemetry/instrumentation-kafkajs';
import { Logger } from '@nestjs/common';

const SENSITIVE_KEYS = ['password', 'token', 'secret', 'authorization', 'cookie', 'accessToken', 'refreshToken', 'pii', 'email', 'phone'];

/**
 * Deeply redacts sensitive data from objects to prevent leakage in logs and traces.
 */
export function redactSensitiveData(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitiveData(item));
  }

  const redacted: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const isSensitive = SENSITIVE_KEYS.some(sk => key.toLowerCase().includes(sk.toLowerCase()));
      if (isSensitive) {
        redacted[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        redacted[key] = redactSensitiveData(obj[key]);
      } else {
        redacted[key] = obj[key];
      }
    }
  }
  return redacted;
}

export function createOtelSdk(serviceName: string): NodeSDK {
  return new NodeSDK({
    resource: resourceFromAttributes({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
    traceExporter: new OTLPTraceExporter({
      url: process.env['OTEL_EXPORTER_OTLP_ENDPOINT'] || 'http://localhost:4318/v1/traces',
    }),
    instrumentations: [
      new HttpInstrumentation({
        requestHook: (span, request) => {
           // Basic redaction for headers could be added here
        }
      }),
      new ExpressInstrumentation(),
      new NestInstrumentation(),
      new KafkaJsInstrumentation({}),
    ],
  });
}

// Global shutdown handler
process.on('SIGTERM', () => {
  Logger.log('SIGTERM received. Starting graceful shutdown of Tracing SDK...', 'Tracing');
});
