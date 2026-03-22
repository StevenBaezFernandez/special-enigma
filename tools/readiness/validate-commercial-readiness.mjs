#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const releaseVersion = process.env.RELEASE_VERSION || 'DEV-SNAPSHOT';
const matrixPath = path.resolve('config/readiness/commercial-eligibility.matrix.json');
const sotPath = path.resolve('config/readiness/operational-readiness.sot.json');
const docsPath = path.resolve('docs/commercial/country-module-readiness-matrix.md');
const sloHistoryPath = path.resolve('evidence/slo/slo-compliance-history.json');

const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
const sotRaw = fs.readFileSync(sotPath, 'utf8');
const sot = JSON.parse(sotRaw);

// 0. Documentation Cross-Check
console.log('📖 Validating Documentation Alignment...');
if (!fs.existsSync(docsPath)) {
  console.error(`❌ docs/commercial/country-module-readiness-matrix.md is missing.`);
  process.exit(1);
}
const docsContent = fs.readFileSync(docsPath, 'utf8');
const sotHash = crypto.createHash('sha256').update(sotRaw).digest('hex');

const allowedStatus = new Set(['GA', 'Beta', 'No listo']);
const violations = [];
const requiredFiscalProviders = new Set(['SAT', 'SEFAZ', 'DIAN', 'TAX_PARTNER', 'DGII', 'STRIPE_TAX']);

if (matrix.generatedFrom?.sha256 !== sotHash) {
  violations.push('commercial-eligibility.matrix.json is not aligned with operational-readiness.sot.json (sha mismatch).');
}

if (JSON.stringify(matrix.countries) !== JSON.stringify(sot.countries)) {
  violations.push('Country catalog differs between matrix and single source of truth.');
}

// SLO History check
let sloHistory = { records: [] };
if (fs.existsSync(sloHistoryPath)) {
  sloHistory = JSON.parse(fs.readFileSync(sloHistoryPath, 'utf8'));
}

for (const [moduleName, countries] of Object.entries(matrix.modules ?? {})) {
  for (const [country, cfg] of Object.entries(countries)) {
    // Cross-check with SOT
    const sotModule = sot.modules?.[moduleName]?.[country];
    if (!sotModule || sotModule.status !== cfg.status) {
      violations.push(`${moduleName}/${country} status mismatch between Matrix (${cfg.status}) and SOT (${sotModule?.status ?? 'missing'}).`);
    }

    // Cross-check with Docs
    const moduleLabel = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
    const docRegex = new RegExp(`\\|\\s*${country}\\s*\\|.*\\|\\s*${cfg.status}\\s*\\|`, 'i');
    if (!docRegex.test(docsContent)) {
       violations.push(`${moduleName}/${country} status '${cfg.status}' not found in docs/commercial/country-module-readiness-matrix.md. Documentation must match Source of Truth.`);
    }

    if (!allowedStatus.has(cfg.status)) {
      violations.push(`${moduleName}/${country} has invalid status '${cfg.status}'.`);
    }
    if (moduleName === 'fiscal' && !requiredFiscalProviders.has(cfg.provider)) {
      violations.push(`${moduleName}/${country} provider '${cfg.provider}' is invalid.`);
    }
    if (cfg.status === 'GA' && cfg.allowSimulation === true) {
      violations.push(`${moduleName}/${country} is GA but allowSimulation=true.`);
    }

    // GA requirement: 90 days SLO history
    if (cfg.status === 'GA') {
        const requiredWindow = sot.slaByTenantModeRegion?.[0]?.historicalWindowDays || 90;

        // Level 5: Verify real historical compliance records
        const relevantSlo = (sloHistory.records ?? []).filter(r => r.status === 'compliant');

        if (requiredWindow > 30 && (sloHistory.retentionDays ?? 0) < requiredWindow) {
             violations.push(`${moduleName}/${country} is GA but SLO history retention (${sloHistory.retentionDays} days) is less than required (${requiredWindow} days).`);
        }

        if (relevantSlo.length < 3) {
            violations.push(`${moduleName}/${country} is GA but lacks sufficient compliant SLO history records (found ${relevantSlo.length}, need at least 3 months for Level 5).`);
        }
    }
  }
}

const sourceFiles = [
  'apps/service/fiscal/app/src/app/app.module.ts',
  'libs/domain/fiscal/infrastructure/src/index.ts',
  'apps/service/plugin-host/app/src/main.ts'
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

console.log('🛡️  Validating Level 5 Enterprise Evidence...');
const latestEvidencePath = path.resolve(`evidence/releases/${releaseVersion}`);
const summaryPath = path.join(latestEvidencePath, 'summary.json');
const manifestPath = path.join(latestEvidencePath, 'manifest.json');
if (!fs.existsSync(summaryPath)) {
  console.warn(`⚠️  Evidence pack for release ${releaseVersion} not found yet; skipping release-summary cross-checks.`);
} else {
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  const requiredGates = sot.commercializationPolicy?.minimumOperationalEvidence ?? [];

  for (const gate of requiredGates) {
    const gateEvidence = summary.gateResults?.find((r) => r.id === gate);
    if (!gateEvidence || gateEvidence.status !== 'passed') {
      violations.push(`Commercialization blocked: missing/failed minimum operational evidence gate '${gate}'.`);
    }
  }

  if (sot.commercializationPolicy?.requireSignedArtifacts) {
    if (!summary.evidence?.sbomPresent || !summary.evidence?.signaturePresent) {
      violations.push('Commercialization blocked: signed artifact evidence is incomplete (sbom/signature).');
    }

    if (!fs.existsSync(manifestPath)) {
      violations.push(`Commercialization blocked: signed evidence manifest is missing (${manifestPath}).`);
    }
  }

  const gaCapabilities = [];
  for (const [moduleName, countryMap] of Object.entries(matrix.modules ?? {})) {
    for (const [country, cfg] of Object.entries(countryMap)) {
      if (cfg.status === 'GA') gaCapabilities.push(`${moduleName}/${country}`);
    }
  }

  if (gaCapabilities.length > 0 && summary.readinessState !== 'ready-with-evidence') {
    violations.push('Commercialization blocked: GA capabilities cannot be published without ready-with-evidence state.');
  }
}

for (const file of sourceFiles) {
  if (!fs.existsSync(path.resolve(file))) continue;
  const content = fs.readFileSync(path.resolve(file), 'utf8');
  for (const { regex, reason } of patterns) {
    if (regex.test(content)) {
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
