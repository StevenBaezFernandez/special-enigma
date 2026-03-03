import { Injectable } from '@nestjs/common';
import { metrics, Meter, ObservableGauge, Counter } from '@opentelemetry/api';

@Injectable()
export class PersistenceMetricsService {
  private readonly meter: Meter;
  private readonly replicationLagGauge: ObservableGauge;
  private readonly reconciliationDivergenceCounter: Counter;
  private readonly migrationSuccessRateCounter: Counter;

  constructor() {
    this.meter = metrics.getMeter('virteex-persistence-meter');

    this.replicationLagGauge = this.meter.createObservableGauge('persistence_replication_lag_ms', {
      description: 'Current replication lag in milliseconds',
    });

    this.reconciliationDivergenceCounter = this.meter.createCounter('persistence_reconciliation_divergence_total', {
      description: 'Total number of detected reconciliation divergences',
    });

    this.migrationSuccessRateCounter = this.meter.createCounter('persistence_migration_total', {
      description: 'Total number of migrations executed',
    });
  }

  recordReplicationLag(lagMs: number, tenantId: string) {
    this.replicationLagGauge.addCallback((result) => {
        result.observe(lagMs, { tenantId });
    });
  }

  recordDivergence(tenantId: string, domain: string) {
    this.reconciliationDivergenceCounter.add(1, { tenantId, domain });
  }

  recordMigration(tenantId: string, status: 'success' | 'failure') {
      this.migrationSuccessRateCounter.add(1, { tenantId, status });
  }
}
