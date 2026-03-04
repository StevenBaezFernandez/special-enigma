#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';

const errors = [];

const policyPath = 'tools/quality-gates/config/error-budget-policy.json';
const historyPath = 'evidence/slo/slo-compliance-history.json';
const catalogPath = 'docs/operations/slo-observability-catalog.md';
const runbookPath = 'docs/runbooks/slo-incident-response.md';

for (const file of [policyPath, historyPath, catalogPath, runbookPath]) {
  if (!existsSync(file)) errors.push(`Missing required SLO governance artifact: ${file}`);
}

if (existsSync(policyPath)) {
  const policy = JSON.parse(readFileSync(policyPath, 'utf8'));
  for (const required of ['windowDays', 'warnThresholdPct', 'blockThresholdPct', 'criticalThresholdPct']) {
    if (typeof policy[required] !== 'number') {
      errors.push(`Policy field '${required}' must be numeric.`);
    }
  }

  if ((policy.warnThresholdPct ?? 0) >= (policy.blockThresholdPct ?? 0)) {
    errors.push('warnThresholdPct must be lower than blockThresholdPct.');
  }

  if ((policy.blockThresholdPct ?? 0) >= (policy.criticalThresholdPct ?? 0)) {
    errors.push('blockThresholdPct must be lower than criticalThresholdPct.');
  }
}

if (existsSync(historyPath)) {
  const history = JSON.parse(readFileSync(historyPath, 'utf8'));
  if (!Array.isArray(history.records) || history.records.length === 0) {
    errors.push('SLO compliance history must contain at least one record.');
  } else {
    for (const [index, record] of history.records.entries()) {
      for (const required of ['period', 'service', 'region', 'objective', 'observed', 'status', 'runbookRef']) {
        if (!record[required]) {
          errors.push(`Record ${index} missing '${required}'.`);
        }
      }

      if (typeof record.errorBudgetConsumedPct !== 'number') {
        errors.push(`Record ${index} has invalid errorBudgetConsumedPct.`);
      }
    }
  }
}

if (existsSync(catalogPath)) {
  const catalog = readFileSync(catalogPath, 'utf8');
  for (const token of [
    'tenant_request_latency_ms',
    'tenant_request_error_rate',
    'tenant_replication_lag_ms',
    'tenant_failover_rto_seconds',
    'tenant_resource_cost_observed_usd',
    'cardinalidad',
    'error budget'
  ]) {
    if (!catalog.toLowerCase().includes(token.toLowerCase())) {
      errors.push(`Catalog is missing required token: '${token}'.`);
    }
  }
}

if (errors.length > 0) {
  console.error('❌ Error budget governance validation failed:\n');
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log('✅ Error budget governance validation passed.');
