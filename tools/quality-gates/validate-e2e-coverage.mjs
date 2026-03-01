#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { globSync } from 'glob';

const policyPath = join('config', 'governance', 'e2e-policy.json');
if (!existsSync(policyPath)) {
  console.error(`✖ Missing e2e policy file: ${policyPath}`);
  process.exit(1);
}

const policy = JSON.parse(readFileSync(policyPath, 'utf8'));
const requiredPlatforms = new Set(policy.requiredPlatforms ?? []);
const exemptions = new Map(Object.entries(policy.exemptions ?? {}));
const errors = [];

const appProjects = globSync('apps/**/app/project.json', { nodir: true });
const e2eProjects = new Set(
  globSync('apps/**/e2e/project.json', { nodir: true }).map((file) => JSON.parse(readFileSync(file, 'utf8')).name)
);

let requiredApps = 0;
for (const appProjectPath of appProjects) {
  const appProject = JSON.parse(readFileSync(appProjectPath, 'utf8'));
  const appName = appProject.name;
  const platformTag = (appProject.tags ?? []).find((tag) => tag.startsWith('platform:'));
  const platform = platformTag?.split(':')[1];

  if (!requiredPlatforms.has(platform)) continue;

  requiredApps += 1;
  const expectedE2EName = appName.replace(/-app$/, '-e2e');
  const hasSiblingE2E = e2eProjects.has(expectedE2EName);

  if (hasSiblingE2E) continue;

  if (exemptions.has(appName)) continue;
  errors.push(`${appName}: missing e2e project '${expectedE2EName}' (required platform: ${platform}).`);
}

for (const [projectName, reason] of exemptions.entries()) {
  if (!appProjects.some((path) => JSON.parse(readFileSync(path, 'utf8')).name === projectName)) {
    errors.push(`Exemption references unknown app '${projectName}' (${reason}).`);
  }
}

if (requiredApps === 0) {
  console.error('✖ E2E coverage validator did not inspect any required app projects.');
  process.exit(1);
}

if (errors.length > 0) {
  console.error('❌ E2E coverage validation failed:\n');
  for (const error of errors) {
    console.error(` - ${error}`);
  }
  process.exit(1);
}

console.log(`✅ E2E coverage validation passed (${requiredApps} required apps inspected).`);
