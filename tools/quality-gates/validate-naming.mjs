#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { globSync } from 'glob';

const policyPath = join('config', 'governance', 'naming-policy.json');
if (!existsSync(policyPath)) {
  console.error(`✖ Missing naming policy file: ${policyPath}`);
  process.exit(1);
}

const policy = JSON.parse(readFileSync(policyPath, 'utf8'));
const rules = policy.rules ?? [];
const exceptions = new Map(Object.entries(policy.exceptions ?? {}));

let hasViolations = false;
const knownProjects = new Set();
let inspectedProjects = 0;

for (const projectPath of globSync('{apps,libs}/**/project.json', { nodir: true })) {
  const project = JSON.parse(readFileSync(projectPath, 'utf8'));
  const name = project.name;
  const normalizedPath = projectPath.replace(/\\/g, '/');
  knownProjects.add(name);
  inspectedProjects += 1;

  for (const rule of rules) {
    const pathRegex = new RegExp(rule.pathRegex);
    if (!pathRegex.test(normalizedPath)) continue;

    const acceptedPrefixes = rule.allowedPrefixes ?? [];
    const matches = acceptedPrefixes.some((prefix) => name.startsWith(prefix));
    if (matches) continue;

    if (exceptions.has(name)) continue;

    console.error(
      `✖ ${name} (${projectPath}) must start with one of: ${acceptedPrefixes.join(', ')}.`
    );
    hasViolations = true;
  }
}

for (const [projectName, reason] of exceptions.entries()) {
  if (!knownProjects.has(projectName)) {
    console.error(`✖ Naming exception references unknown project '${projectName}' (${reason}).`);
    hasViolations = true;
  }
}

if (inspectedProjects === 0) {
  console.error('✖ Naming validator did not inspect any project.json files.');
  process.exit(1);
}

if (hasViolations) process.exit(1);
console.log(`✔ Naming validation passed (${inspectedProjects} projects inspected)`);
