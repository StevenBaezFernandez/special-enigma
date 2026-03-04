#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const releaseVersion = process.env.RELEASE_VERSION || 'DEV-SNAPSHOT';
const sotPath = path.resolve('config/readiness/operational-readiness.sot.json');
const matrixPath = path.resolve('config/readiness/commercial-eligibility.matrix.json');
const reportPath = path.resolve('evidence/reports/RELEASE_READINESS_REPORT.md');
const summaryPath = path.resolve(`evidence/releases/${releaseVersion}/summary.json`);
const manifestPath = path.resolve(`evidence/releases/${releaseVersion}/manifest.json`);

const errors = [];

function readJson(file) {
  if (!fs.existsSync(file)) {
    errors.push(`Missing required file: ${file}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const sotRaw = fs.existsSync(sotPath) ? fs.readFileSync(sotPath, 'utf8') : null;
const sot = sotRaw ? JSON.parse(sotRaw) : null;
const matrix = readJson(matrixPath);
const summary = readJson(summaryPath);
const manifest = readJson(manifestPath);

if (sotRaw && matrix) {
  const expectedHash = crypto.createHash('sha256').update(sotRaw).digest('hex');
  if (matrix.generatedFrom?.sha256 !== expectedHash) {
    errors.push('Matrix does not point to the current source-of-truth hash.');
  }

  if (JSON.stringify(matrix.modules) !== JSON.stringify(sot.modules)) {
    errors.push('Matrix module statuses are inconsistent with the source of truth.');
  }
}

if (summary && sot) {
  const expectedCommercial = {};
  for (const [moduleName, countryMap] of Object.entries(sot.modules)) {
    expectedCommercial[moduleName] = {};
    for (const [country, cfg] of Object.entries(countryMap)) {
      expectedCommercial[moduleName][country] = cfg.status;
    }
  }

  if (JSON.stringify(summary.evidence?.commercialReadiness?.modules) !== JSON.stringify(expectedCommercial)) {
    errors.push('Evidence summary commercial matrix is inconsistent with source-of-truth statuses.');
  }

  for (const sla of sot.slaByTenantModeRegion ?? []) {
    if ((sla.historicalSamples ?? 0) < 1000) {
      errors.push(`SLA ${sla.tenantMode}/${sla.region} has insufficient historical samples (<1000).`);
    }
    for (const gateId of sla.gateIds ?? []) {
      const gate = summary.gateResults?.find((item) => item.id === gateId);
      if (!gate || gate.status !== 'passed') {
        errors.push(`SLA ${sla.tenantMode}/${sla.region} references gate '${gateId}' without passing evidence.`);
      }
    }
  }
}

if (manifest && summary) {
  const summaryRelPath = path.relative(process.cwd(), summaryPath);
  const summaryArtifact = manifest.artifacts?.find((artifact) => artifact.path === summaryRelPath);

  if (!summaryArtifact) {
    errors.push('Signed manifest does not include summary.json artifact.');
  } else {
    const summaryHash = crypto.createHash('sha256').update(fs.readFileSync(summaryPath)).digest('hex');
    if (summaryArtifact.sha256 !== summaryHash) {
      errors.push('Signed manifest hash for summary.json does not match current content.');
    }
  }
}

if (fs.existsSync(reportPath) && sot) {
  const reportContent = fs.readFileSync(reportPath, 'utf8');
  for (const [moduleName, countries] of Object.entries(sot.modules)) {
    const mx = countries.MX?.status ?? '-';
    const br = countries.BR?.status ?? '-';
    const co = countries.CO?.status ?? '-';
    const us = countries.US?.status ?? '-';
    const row = `| ${moduleName} | ${mx} | ${br} | ${co} | ${us} |`;
    if (!reportContent.includes(row)) {
      errors.push(`Readiness report is inconsistent for module row: ${moduleName}.`);
    }
  }

  if (!reportContent.includes('## 5. SLA by Tenant Mode / Region')) {
    errors.push('Readiness report does not publish SLA by tenant mode/region.');
  }
}

if (errors.length > 0) {
  console.error('❌ Readiness consistency validation failed:');
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log('✅ Readiness consistency validation passed.');
