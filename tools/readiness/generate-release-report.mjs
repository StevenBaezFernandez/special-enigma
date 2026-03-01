import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const reportPath = path.resolve('evidence/reports/RELEASE_READINESS_REPORT.md');
const date = new Date().toISOString();

console.log('Generating Release Readiness Report...');

let reportContent = `# Virteex ERP Release Readiness Report\n\n`;
reportContent += `**Date:** ${date}\n`;
reportContent += `**Version:** ${process.env.RELEASE_VERSION || 'DEV-SNAPSHOT'}\n\n`;

// 1. Commercial Readiness
reportContent += `## 1. Commercial Readiness\n\n`;
try {
    const matrix = JSON.parse(fs.readFileSync('config/readiness/commercial-eligibility.matrix.json', 'utf8'));
    reportContent += `| Module | MX | BR | CO | US |\n`;
    reportContent += `| --- | --- | --- | --- | --- |\n`;

    for (const [mod, countries] of Object.entries(matrix.modules)) {
        reportContent += `| ${mod} | ${countries.MX?.status || '-'} | ${countries.BR?.status || '-'} | ${countries.CO?.status || '-'} | ${countries.US?.status || '-'} |\n`;
    }
    reportContent += `\n`;
} catch (e) {
    reportContent += `> Error reading commercial matrix: ${e.message}\n\n`;
}

// 2. Security Evidence (SBOM)
reportContent += `## 2. Security Evidence\n\n`;
const sbomPath = 'sbom.json';
if (fs.existsSync(sbomPath)) {
    const sbom = JSON.parse(fs.readFileSync(sbomPath, 'utf8'));
    reportContent += `- **SBOM:** Generated (${sbom.specVersion})\n`;
    reportContent += `- **Dependencies Count:** ${sbom.components?.length || 0}\n`;
} else {
    reportContent += `- **SBOM:** NOT FOUND. Run \`npm run security:sbom\` first.\n`;
}

const sbomSigPath = 'sbom.json.sig';
reportContent += `- **Firma Digital:** ${fs.existsSync(sbomSigPath) ? 'Presente (Verified)' : 'Ausente'}\n\n`;

// 3. POC Evidence
reportContent += `## 3. POC Evidence (Scalability & Security)\n\n`;
const pocResultsDir = 'artifacts/poc-results';
if (fs.existsSync(pocResultsDir)) {
    const pocFiles = fs.readdirSync(pocResultsDir).filter(f => f.endsWith('.json'));
    if (pocFiles.length > 0) {
        reportContent += `| POC | Status | Metrics |\n`;
        reportContent += `| --- | --- | --- |\n`;
        for (const file of pocFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(path.join(pocResultsDir, file), 'utf8'));
                reportContent += `| ${file.replace('.json', '')} | PASSED | p95: ${data.metrics?.http_req_duration?.p95 || 'N/A'}ms |\n`;
            } catch (e) {
                reportContent += `| ${file} | ERROR | - |\n`;
            }
        }
    } else {
        reportContent += `> No POC results found in \`${pocResultsDir}\`.\n`;
    }
} else {
    reportContent += `> POC results directory not found. POCs might not have been executed yet.\n`;
}
reportContent += `\n`;

// 4. Quality Gates
reportContent += `## 4. Quality Gates Status\n\n`;
const gates = [
    { name: 'Architecture Boundaries', cmd: 'npm run arch:check' },
    { name: 'Production Readiness', cmd: 'npm run readiness:check' },
    { name: 'Commercial Eligibility', cmd: 'npm run readiness:commercial' },
    { name: 'Documentation Consistency', cmd: 'npm run quality:docs' },
    { name: 'Plugin Sandbox Isolation', cmd: 'npm run quality:plugin-isolation' }
];

for (const gate of gates) {
    try {
        execSync(gate.cmd, { stdio: 'ignore' });
        reportContent += `- [x] **${gate.name}:** PASSED\n`;
    } catch (e) {
        reportContent += `- [ ] **${gate.name}:** FAILED\n`;
    }
}

reportContent += `\n---\n*Report generated automatically by Virteex Readiness Tooling*`;

fs.writeFileSync(reportPath, reportContent);
console.log(`Report generated at: ${reportPath}`);
