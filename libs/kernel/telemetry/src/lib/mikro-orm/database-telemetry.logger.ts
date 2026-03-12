import { Logger } from '@mikro-orm/core';
import { Injectable, Logger as NestLogger } from '@nestjs/common';
import { getTenantContext } from '@virteex/kernel-tenant-context';
import { metrics } from '@opentelemetry/api';

@Injectable()
export class DatabasePerformanceInterceptor {
  private readonly logger = new NestLogger(DatabasePerformanceInterceptor.name);
  private readonly meter = metrics.getMeter('virteex-database-meter');
  private readonly slowQueryCounter = this.meter.createCounter('db_slow_queries_total');
  private readonly queryHistogram = this.meter.createHistogram('db_query_duration_ms');

  private readonly SLOW_QUERY_THRESHOLD = 100; // ms
}

/**
 * Custom Logger for MikroORM that tracks performance and tenant context
 */
export class DatabaseTelemetryLogger implements Logger {
  private readonly nestLogger = new NestLogger('DatabaseTelemetry');
  private readonly meter = metrics.getMeter('virteex-database-meter');
  private readonly slowQueryCounter = this.meter.createCounter('db_slow_queries_total');
  private readonly queryHistogram = this.meter.createHistogram('db_query_duration_ms');
  private readonly SLOW_QUERY_THRESHOLD = 100;

  log(namespace: string, message: string, context?: unknown): void {
    this.nestLogger.log(`[${namespace}] ${message}`);
  }

  error(namespace: string, message: string, context?: unknown): void {
    this.nestLogger.error(`[${namespace}] ${message}`);
  }

  warn(namespace: string, message: string, context?: unknown): void {
    this.nestLogger.warn(`[${namespace}] ${message}`);
  }

  setDebugMode(debugMode: unknown): void {
      // noop
  }

  isEnabled(namespace: string): boolean {
      return true;
  }

  logQuery(params: { query: string; took?: number; tenantId?: string }): void {
    const tenantContext = getTenantContext();
    const tenantId = tenantContext?.tenantId || 'system';
    const took = params.took || 0;

    this.queryHistogram.record(took, { tenantId, type: this.getQueryType(params.query) });

    if (took > this.SLOW_QUERY_THRESHOLD) {
      this.slowQueryCounter.add(1, { tenantId });
      this.nestLogger.warn(`SLOW QUERY [${tenantId}] (${took}ms): ${params.query}`);
    }
  }

  private getQueryType(query: string): string {
    const q = query.trim().toUpperCase();
    if (q.startsWith('SELECT')) return 'SELECT';
    if (q.startsWith('INSERT')) return 'INSERT';
    if (q.startsWith('UPDATE')) return 'UPDATE';
    if (q.startsWith('DELETE')) return 'DELETE';
    return 'OTHER';
  }
}
