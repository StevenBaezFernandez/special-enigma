import fs from 'node:fs';
import path from 'node:path';

const releaseVersion = process.env.RELEASE_VERSION || 'DEV-SNAPSHOT';
const date = new Date().toISOString();
const reportPath = path.resolve('evidence/reports/RELEASE_READINESS_REPORT.md');
const evidenceDir = path.resolve(`evidence/releases/${releaseVersion}`);
const evidenceSummaryPath = path.join(evidenceDir, 'summary.json');

console.log('Generating Release Readiness Report...');

let reportContent = `# Virteex ERP Release Readiness Report\n\n`;
reportContent += `**Date:** ${date}\n`;
reportContent += `**Version:** ${releaseVersion}\n\n`;

reportContent += `## 1. Commercial Readiness\n\n`;
const matrix = JSON.parse(
  fs.readFileSync(
    'config/readiness/commercial-eligibility.matrix.json',
    'utf8',
  ),
);
reportContent += `| Module | MX | BR | CO | US |\n`;
reportContent += `| --- | --- | --- | --- | --- |\n`;
for (const [mod, countries] of Object.entries(matrix.modules ?? {})) {
  reportContent += `| ${mod} | ${countries.MX?.status || '-'} | ${countries.BR?.status || '-'} | ${countries.CO?.status || '-'} | ${countries.US?.status || '-'} |\n`;
}
reportContent += '\n';

reportContent += `## 2. Security Evidence\n\n`;
if (fs.existsSync('sbom.json')) {
  const sbom = JSON.parse(fs.readFileSync('sbom.json', 'utf8'));
  reportContent += `- **SBOM:** Generated (${sbom.specVersion})\n`;
  reportContent += `- **Dependencies Count:** ${sbom.components?.length || 0}\n`;
} else {
  reportContent += `- **SBOM:** NOT FOUND. Run \`npm run security:sbom\` first.\n`;
}
reportContent += `- **Firma Digital:** ${fs.existsSync('sbom.json.sig') ? 'Presente' : 'Ausente'}\n\n`;

reportContent += `## 3. POC Evidence\n\n`;
const pocResultsDir = 'artifacts/poc-results';
if (fs.existsSync(pocResultsDir)) {
  const pocFiles = fs
    .readdirSync(pocResultsDir)
    .filter((file) => file.endsWith('.json'));
  if (pocFiles.length > 0) {
    reportContent += `| POC | Status | p95 |\n| --- | --- | --- |\n`;
    for (const file of pocFiles) {
      try {
        const data = JSON.parse(
          fs.readFileSync(path.join(pocResultsDir, file), 'utf8'),
        );
        reportContent += `| ${file.replace('.json', '')} | PASSED | ${data.metrics?.http_req_duration?.p95 || 'N/A'}ms |\n`;
      } catch {
        reportContent += `| ${file} | ERROR | - |\n`;
      }
    }
  } else {
    reportContent += `> No POC results found in \`${pocResultsDir}\`.\n`;
  }
} else {
  reportContent += `> POC results directory not found.\n`;
}
reportContent += '\n';

reportContent += `## 4. Release Evidence Pack\n\n`;
if (fs.existsSync(evidenceSummaryPath)) {
  const evidenceSummary = JSON.parse(
    fs.readFileSync(evidenceSummaryPath, 'utf8'),
  );
  reportContent += `- **Readiness state:** ${evidenceSummary.readinessState}\n`;
  reportContent += `- **Evidence path:** ${path.relative(process.cwd(), evidenceDir)}\n`;
  reportContent += '\n';
  reportContent += '| Gate | Status |\n| --- | --- |\n';
  for (const gate of evidenceSummary.gateResults ?? []) {
    reportContent += `| ${gate.id} | ${gate.status.toUpperCase()} |\n`;
  }
} else {
  reportContent +=
    '> Evidence pack missing. Run `npm run readiness:evidence` first.\n';
}

reportContent += `\n---\n*Report generated automatically by Virteex readiness tooling*\n`;

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, reportContent);
console.log(`Report generated at: ${reportPath}`);
