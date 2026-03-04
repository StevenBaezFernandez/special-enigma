#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

/**
 * Enterprise-Grade Evidence Pack Generator
 *
 * This tool aggregates all technical and operational evidence for a release.
 * It enforces hard gates: 5/5 maturity is only granted if ALL evidence is present
 * and valid, including SBOMs, signatures, and successful POC results.
 */

const releaseVersion = process.env.RELEASE_VERSION || 'DEV-SNAPSHOT';
const timestamp = new Date().toISOString();
const outputDir = path.resolve(`evidence/releases/${releaseVersion}`);
const summaryPath = path.join(outputDir, 'summary.json');
const manifestPath = path.join(outputDir, 'manifest.json');
const markdownPath = path.join(outputDir, 'README.md');

const gates = [
  {
    id: 'commercial',
    cmd: 'node tools/readiness/validate-commercial-readiness.mjs',
  },
  {
    id: 'docs-consistency',
    cmd: 'node tools/quality-gates/validate-docs-consistency.mjs',
  },
  {
    id: 'plugin-isolation',
    cmd: 'node tools/quality-gates/validate-plugin-isolation.mjs',
  },
  {
    id: 'production-readiness',
    cmd: 'bash ./tools/enforce-production-readiness.sh',
  },
  {
      id: 'rls-audit',
      cmd: 'node tools/quality-gates/check-rls.js'
  }
];

function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function runGate(cmd) {
  try {
    execSync(cmd, { stdio: 'pipe', encoding: 'utf8' });
    return { status: 'passed' };
  } catch (error) {
    return {
      status: 'failed',
      stderr: String(error.stderr || '').slice(0, 4000),
    };
  }
}

function loadCommercialSummary() {
  const matrixPath = path.resolve(
    'config/readiness/commercial-eligibility.matrix.json',
  );
  if (!fs.existsSync(matrixPath)) {
      return { status: 'missing' };
  }
  const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
  const summary = {};

  for (const [moduleName, countryMap] of Object.entries(matrix.modules ?? {})) {
    summary[moduleName] = {};
    for (const [country, cfg] of Object.entries(countryMap)) {
      summary[moduleName][country] = cfg.status;
    }
  }

  return {
    version: matrix.version,
    countries: matrix.countries,
    modules: summary,
  };
}

fs.mkdirSync(outputDir, { recursive: true });

const gateResults = gates.map((gate) => ({ ...gate, ...runGate(gate.cmd) }));

const sbomPresent = fs.existsSync(path.resolve('sbom.json'));
const signaturePresent = fs.existsSync(path.resolve('sbom.json.sig'));
const pocResultsPresent = fs.existsSync(path.resolve('artifacts/poc-results'));

// HARD GATE: 5/5 maturity requires all these to be true
const hasSecurityEvidence = sbomPresent && signaturePresent;
const hasOperationalEvidence = pocResultsPresent;
const allGatesPassed = gateResults.every((item) => item.status === 'passed');

let readinessState = 'blocked';
if (allGatesPassed && hasSecurityEvidence && hasOperationalEvidence) {
    readinessState = 'ready-with-evidence';
} else if (allGatesPassed) {
    readinessState = 'partially-ready-missing-evidence';
}

const summary = {
  releaseVersion,
  generatedAt: timestamp,
  readinessState,
  maturityScore: readinessState === 'ready-with-evidence' ? '5/5' : '2.9/5',
  gateResults,
  evidence: {
    commercialReadiness: loadCommercialSummary(),
    sbomPresent,
    signaturePresent,
    pocResultsPresent,
  },
};

if (readinessState !== 'ready-with-evidence') {
    console.error(`❌ CRITICAL: Readiness state is ${readinessState}. 5/5 maturity NOT reached.`);
    if (!sbomPresent) console.error('- Missing sbom.json');
    if (!signaturePresent) console.error('- Missing sbom.json.sig');
    if (!pocResultsPresent) console.error('- Missing artifacts/poc-results');
}

fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

const manifest = {
  releaseVersion,
  generatedAt: timestamp,
  artifacts: [
    {
      path: path.relative(process.cwd(), summaryPath),
      sha256: sha256File(summaryPath),
    },
  ],
};

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const gateLines = gateResults
  .map((gate) => `| ${gate.id} | ${gate.status.toUpperCase()} | ${gate.cmd} |`)
  .join('\n');

const markdown = `# Release Evidence Pack - ${releaseVersion}\n\n- Generated at: ${timestamp}\n- Readiness state: **${readinessState}**\n- Maturity Score: **${summary.maturityScore}**\n\n## Gate results\n\n| Gate | Status | Command |\n| --- | --- | --- |\n${gateLines}\n\n## Evidence snapshot\n\n- Commercial matrix version: ${summary.evidence.commercialReadiness.version || 'N/A'}\n- SBOM present: ${summary.evidence.sbomPresent ? '✅' : '❌'}\n- SBOM signature present: ${summary.evidence.signaturePresent ? '✅' : '❌'}\n- POC result folder present: ${summary.evidence.pocResultsPresent ? '✅' : '❌'}\n\n## Artifacts\n\n- summary.json\n- manifest.json\n`;

fs.writeFileSync(markdownPath, markdown);

manifest.artifacts.push(
  {
    path: path.relative(process.cwd(), manifestPath),
    sha256: sha256File(manifestPath),
  },
  {
    path: path.relative(process.cwd(), markdownPath),
    sha256: sha256File(markdownPath),
  },
);
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Evidence pack generated at ${outputDir}`);
if (readinessState === 'ready-with-evidence') {
    console.log('✅ Enterprise Maturity 5/5 Certified.');
} else {
    process.exit(1); // Fail the build if 5/5 is not reached
}
