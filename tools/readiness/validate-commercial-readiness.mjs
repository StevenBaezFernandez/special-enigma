#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const matrixPath = path.resolve('config/readiness/commercial-eligibility.matrix.json');
const raw = fs.readFileSync(matrixPath, 'utf8');
const matrix = JSON.parse(raw);

const allowedStatus = new Set(['GA', 'Beta', 'No listo']);
const violations = [];
const requiredFiscalProviders = new Set(['SAT', 'SEFAZ', 'DIAN', 'TAX_PARTNER', 'DGII', 'STRIPE_TAX']); // Added STRIPE_TAX for US GA

for (const [moduleName, countries] of Object.entries(matrix.modules ?? {})) {
  for (const [country, cfg] of Object.entries(countries)) {
    if (!allowedStatus.has(cfg.status)) {
      violations.push(`${moduleName}/${country} has invalid status '${cfg.status}'.`);
    }
    if (moduleName === 'fiscal' && !requiredFiscalProviders.has(cfg.provider)) {
      violations.push(`${moduleName}/${country} provider '${cfg.provider}' is invalid.`);
    }
    if (cfg.status === 'GA' && cfg.allowSimulation === true) {
      violations.push(`${moduleName}/${country} is GA but allowSimulation=true.`);
    }
  }
}

const sourceFiles = [
  'apps/api/fiscal/app/src/app/app.module.ts',
  'libs/domain/fiscal/infrastructure/src/index.ts',
  'apps/api/plugin-host/app/src/main.ts'
];

const patterns = [
  { regex: /MockFiscalProvider/g, reason: 'Mock fiscal provider referenced in runtime source' },
  { regex: /mock-jwt-token/g, reason: 'Mock auth token in runtime source' },
  { regex: /THIS IS NOT LEGAL FOR PRODUCTION/g, reason: 'Mock/legal warning string must remain test/dev-only' }
];

if (matrix.modules?.fiscal?.US?.status === 'GA' && matrix.modules.fiscal.US.provider === 'TAX_PARTNER') {
  violations.push('US fiscal cannot be marked GA with TAX_PARTNER placeholder provider. Keep status Beta until real partner is certified.');
}

if (matrix.modules?.marketplace?.CO?.status === 'GA') {
  violations.push('Marketplace CO cannot be GA before hardened sandbox evidence is available.');
}

// Level 5 Evidence Validation
console.log('🛡️  Validating Level 5 Enterprise Evidence...');
const latestEvidencePath = path.resolve('evidence/releases/2026.03-rc1');
if (!fs.existsSync(latestEvidencePath)) {
  violations.push('Level 5 Certification requires verified evidence pack for the current release (2026.03-rc1).');
} else {
  const summary = JSON.parse(fs.readFileSync(path.join(latestEvidencePath, 'summary.json'), 'utf8'));
  const requiredGates = ['rls-audit', 'isolation-adversarial', 'migration-integrity', 'failover-drill'];

  for (const gate of requiredGates) {
    const gateEvidence = summary.gates?.[gate] || summary.results?.find(r => r.id === gate);
    if (!gateEvidence || gateEvidence.status !== 'PASSED') {
      violations.push(`Level 5 Certification FAILED: Missing or failed evidence for gate '${gate}'.`);
    }
  }
}

for (const file of sourceFiles) {
  if (!fs.existsSync(path.resolve(file))) continue;
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
