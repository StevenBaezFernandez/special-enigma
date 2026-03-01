#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

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
const readinessState = gateResults.every((item) => item.status === 'passed')
  ? 'ready-with-evidence'
  : 'blocked';

const summary = {
  releaseVersion,
  generatedAt: timestamp,
  readinessState,
  gateResults,
  evidence: {
    commercialReadiness: loadCommercialSummary(),
    sbomPresent: fs.existsSync(path.resolve('sbom.json')),
    signaturePresent: fs.existsSync(path.resolve('sbom.json.sig')),
    pocResultsPresent: fs.existsSync(path.resolve('artifacts/poc-results')),
  },
};

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

const markdown = `# Release Evidence Pack - ${releaseVersion}\n\n- Generated at: ${timestamp}\n- Readiness state: **${readinessState}**\n\n## Gate results\n\n| Gate | Status | Command |\n| --- | --- | --- |\n${gateLines}\n\n## Evidence snapshot\n\n- Commercial matrix version: ${summary.evidence.commercialReadiness.version}\n- SBOM present: ${summary.evidence.sbomPresent ? 'yes' : 'no'}\n- SBOM signature present: ${summary.evidence.signaturePresent ? 'yes' : 'no'}\n- POC result folder present: ${summary.evidence.pocResultsPresent ? 'yes' : 'no'}\n\n## Artifacts\n\n- summary.json\n- manifest.json\n`;

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
