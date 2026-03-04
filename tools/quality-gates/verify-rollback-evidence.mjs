#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const reportDir = path.resolve('evidence/reports/rollback');

const githubRef = process.env.GITHUB_REF || '';
const isReleaseRef = githubRef.startsWith('refs/heads/release/');
const enforce = process.env.ENFORCE_ROLLBACK_EVIDENCE === '1';
if (!isReleaseRef && !enforce) {
  console.log('ℹ️ Rollback evidence gate skipped (non-release branch).');
  process.exit(0);
}

if (!fs.existsSync(reportDir)) {
  console.error(`❌ Missing rollback evidence directory: ${reportDir}`);
  process.exit(1);
}

const files = fs.readdirSync(reportDir).filter((file) => file.endsWith('.json'));
if (files.length === 0) {
  console.error('❌ No rollback evidence reports found. Release is blocked.');
  process.exit(1);
}

const invalid = [];
for (const file of files) {
  const reportPath = path.join(reportDir, file);
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  if (!report.tenantId || !report.operationId || report.verified !== true || !report.signature) {
    invalid.push(file);
  }
}

if (invalid.length > 0) {
  console.error(`❌ Invalid rollback evidence reports: ${invalid.join(', ')}`);
  process.exit(1);
}

console.log(`✅ Rollback evidence verification passed (${files.length} reports).`);
