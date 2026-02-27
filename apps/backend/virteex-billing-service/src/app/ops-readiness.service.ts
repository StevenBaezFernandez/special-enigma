import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import Redis from 'ioredis';
import { Kafka } from 'kafkajs';
import axios from 'axios';

export type DependencyState = 'up' | 'degraded' | 'down';

export interface DependencyReport {
  name: string;
  state: DependencyState;
  severity: 'critical' | 'high' | 'medium';
  latencyMs: number;
  detail?: string;
}

@Injectable()
export class OpsReadinessService {
  constructor(private readonly configService: ConfigService) {}

  async checkAll(): Promise<{ status: 'ready' | 'degraded' | 'down'; dependencies: DependencyReport[] }> {
    const dependencies = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkKafka(),
      this.checkFiscalProvider(),
      this.checkPaymentsProvider(),
    ]);

    const hasCriticalDown = dependencies.some((d) => d.severity === 'critical' && d.state === 'down');
    const hasAnyDownOrDegraded = dependencies.some((d) => d.state !== 'up');

    const status = hasCriticalDown ? 'down' : hasAnyDownOrDegraded ? 'degraded' : 'ready';
    return { status, dependencies };
  }

  private async checkDatabase(): Promise<DependencyReport> {
    const started = Date.now();
    const host = this.configService.get<string>('BILLING_DB_HOST') || this.configService.get<string>('DB_HOST');
    const port = this.configService.get<number>('BILLING_DB_PORT') || this.configService.get<number>('DB_PORT') || 5432;
    const user = this.configService.get<string>('BILLING_DB_USER') || this.configService.get<string>('DB_USER');
    const password = this.configService.get<string>('BILLING_DB_PASSWORD') || this.configService.get<string>('DB_PASSWORD');
    const database = this.configService.get<string>('BILLING_DB_NAME');

    if (!host || !user || !password || !database) {
      return {
        name: 'database',
        state: 'down',
        severity: 'critical',
        latencyMs: Date.now() - started,
        detail: 'Missing DB configuration.'
      };
    }

    const client = new Client({ host, port, user, password, database, statement_timeout: 3000, connectionTimeoutMillis: 3000 });
    try {
      await client.connect();
      await client.query('SELECT 1');
      return { name: 'database', state: 'up', severity: 'critical', latencyMs: Date.now() - started };
    } catch (error) {
      return {
        name: 'database',
        state: 'down',
        severity: 'critical',
        latencyMs: Date.now() - started,
        detail: error instanceof Error ? error.message : 'Unknown DB error'
      };
    } finally {
      await client.end().catch(() => undefined);
    }
  }

  private async checkRedis(): Promise<DependencyReport> {
    const started = Date.now();
    const url = this.configService.get<string>('REDIS_URL');
    if (!url) {
      return { name: 'redis', state: 'degraded', severity: 'high', latencyMs: Date.now() - started, detail: 'REDIS_URL not configured.' };
    }

    const redis = new Redis(url, { lazyConnect: true, connectTimeout: 3000, maxRetriesPerRequest: 1 });
    try {
      await redis.connect();
      const pong = await redis.ping();
      return { name: 'redis', state: pong === 'PONG' ? 'up' : 'degraded', severity: 'high', latencyMs: Date.now() - started };
    } catch (error) {
      return {
        name: 'redis',
        state: 'down',
        severity: 'high',
        latencyMs: Date.now() - started,
        detail: error instanceof Error ? error.message : 'Unknown Redis error'
      };
    } finally {
      await redis.quit().catch(() => undefined);
    }
  }

  private async checkKafka(): Promise<DependencyReport> {
    const started = Date.now();
    const brokers = (this.configService.get<string>('KAFKA_BROKERS') ?? '').split(',').map((v) => v.trim()).filter(Boolean);
    if (brokers.length === 0) {
      return { name: 'kafka', state: 'degraded', severity: 'high', latencyMs: Date.now() - started, detail: 'KAFKA_BROKERS not configured.' };
    }

    const admin = new Kafka({ clientId: 'billing-readiness', brokers }).admin();
    try {
      await admin.connect();
      await admin.listTopics();
      return { name: 'kafka', state: 'up', severity: 'high', latencyMs: Date.now() - started };
    } catch (error) {
      return {
        name: 'kafka',
        state: 'down',
        severity: 'high',
        latencyMs: Date.now() - started,
        detail: error instanceof Error ? error.message : 'Unknown Kafka error'
      };
    } finally {
      await admin.disconnect().catch(() => undefined);
    }
  }

  private async checkFiscalProvider(): Promise<DependencyReport> {
    const started = Date.now();
    const url = this.configService.get<string>('FINKOK_URL');
    if (!url) {
      return { name: 'fiscal-provider', state: 'degraded', severity: 'critical', latencyMs: Date.now() - started, detail: 'FINKOK_URL not configured.' };
    }

    try {
      await axios.get(url, { timeout: 3000, validateStatus: () => true });
      return { name: 'fiscal-provider', state: 'up', severity: 'critical', latencyMs: Date.now() - started };
    } catch (error) {
      return {
        name: 'fiscal-provider',
        state: 'down',
        severity: 'critical',
        latencyMs: Date.now() - started,
        detail: error instanceof Error ? error.message : 'Unknown fiscal provider error'
      };
    }
  }

  private async checkPaymentsProvider(): Promise<DependencyReport> {
    const started = Date.now();
    const secret = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secret) {
      return { name: 'payments-provider', state: 'down', severity: 'critical', latencyMs: Date.now() - started, detail: 'STRIPE_SECRET_KEY missing.' };
    }

    if ((this.configService.get<string>('NODE_ENV') ?? 'development') === 'production' && secret.startsWith('sk_test_')) {
      return { name: 'payments-provider', state: 'down', severity: 'critical', latencyMs: Date.now() - started, detail: 'Production using Stripe test key.' };
    }

    return { name: 'payments-provider', state: 'up', severity: 'critical', latencyMs: Date.now() - started };
  }
}
