import { Injectable, Logger } from '@nestjs/common';
import { Counter, Histogram } from '@opentelemetry/api-metrics';
import { metrics } from '@opentelemetry/api';

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);
  private readonly jobSuccessCounter: Counter;
  private readonly jobFailureCounter: Counter;
  private readonly jobLatencyHistogram: Histogram;

  constructor() {
    const meter = metrics.getMeter('virteex-scheduler');
    this.jobSuccessCounter = meter.createCounter('scheduler.job.success', {
      description: 'Count of successful job executions',
    });
    this.jobFailureCounter = meter.createCounter('scheduler.job.failure', {
      description: 'Count of failed job executions',
    });
    this.jobLatencyHistogram = meter.createHistogram('scheduler.job.latency', {
      description: 'Histogram of job processing latency',
      unit: 'ms',
    });
  }

  recordJobSuccess(type: string, tenantId: string) {
    this.jobSuccessCounter.add(1, { 'job.type': type, 'tenant.id': tenantId });
  }

  recordJobFailure(type: string, tenantId: string, errorType: string) {
    this.jobFailureCounter.add(1, { 'job.type': type, 'tenant.id': tenantId, 'error.type': errorType });
  }

  recordJobLatency(type: string, tenantId: string, durationMs: number) {
    this.jobLatencyHistogram.record(durationMs, { 'job.type': type, 'tenant.id': tenantId });
  }
}
