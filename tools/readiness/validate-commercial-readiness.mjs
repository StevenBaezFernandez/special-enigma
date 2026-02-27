#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const matrixPath = path.resolve('config/readiness/commercial-eligibility.matrix.json');
const raw = fs.readFileSync(matrixPath, 'utf8');
const matrix = JSON.parse(raw);

const allowedStatus = new Set(['GA', 'Beta', 'No listo']);
const violations = [];

for (const [moduleName, countries] of Object.entries(matrix.modules ?? {})) {
  for (const [country, cfg] of Object.entries(countries)) {
    if (!allowedStatus.has(cfg.status)) {
      violations.push(`${moduleName}/${country} has invalid status '${cfg.status}'.`);
    }
    if (cfg.status === 'GA' && cfg.allowSimulation === true) {
      violations.push(`${moduleName}/${country} is GA but allowSimulation=true.`);
    }
  }
}

const sourceFiles = [
  'apps/backend/virteex-fiscal-service/src/app/app.module.ts',
  'libs/domains/fiscal/infrastructure/src/index.ts',
  'apps/backend/virteex-plugin-host/src/main.ts'
];

const patterns = [
  { regex: /MockFiscalProvider/g, reason: 'Mock fiscal provider referenced in runtime source' },
  { regex: /mock-jwt-token/g, reason: 'Mock auth token in runtime source' },
  { regex: /THIS IS NOT LEGAL FOR PRODUCTION/g, reason: 'Mock/legal warning string must remain test/dev-only' }
];

for (const file of sourceFiles) {
  const content = fs.readFileSync(path.resolve(file), 'utf8');
  for (const { regex, reason } of patterns) {
    if (regex.test(content)) {
      // allow the warning message only in the mock adapter source file
      if (reason.includes('warning') && file.includes('mock-fiscal-provider')) continue;
      violations.push(`${reason}: ${file}`);
    }
  }
}

if (violations.length > 0) {
  console.error('Commercial/readiness validation failed:');
  for (const v of violations) console.error(` - ${v}`);
  process.exit(1);
}

console.log('Commercial/readiness validation passed.');
