#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const searchDirs = ['apps', 'libs'];
let hasViolations = false;

const POLICY_MODE = process.env.TAG_POLICY_MODE || 'warn';
const REQUIRED_FAMILIES = ['scope:', 'type:', 'platform:', 'criticality:'];

function validateDir(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  if (entries.some(e => e.name === 'project.json')) {
    const projectPath = join(dir, 'project.json');
    const project = JSON.parse(readFileSync(projectPath, 'utf8'));
    const tags = project.tags || [];

    const missingFamilies = REQUIRED_FAMILIES.filter(
      family => !tags.some(t => t.startsWith(family))
    );

    if (missingFamilies.length > 0) {
      const msg = `✖ ${project.name} (${projectPath}) is missing required tags (${missingFamilies.join(', ')})`;
      if (POLICY_MODE === 'error') {
        console.error(msg);
        hasViolations = true;
      } else {
        console.warn(`⚠ (Warn) ${msg}`);
      }
    }
  }

  for (const entry of entries) {
    if (entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
      validateDir(join(dir, entry.name));
    }
  }
}

for (const dir of searchDirs) {
  if (existsSync(dir)) validateDir(dir);
}

if (hasViolations) process.exit(1);
console.log('✔ Project tags validation passed');
