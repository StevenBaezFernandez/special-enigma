#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const searchDirs = ['apps', 'libs'];
let hasViolations = false;

function validateDir(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  if (entries.some(e => e.name === 'project.json')) {
    const projectPath = join(dir, 'project.json');
    const project = JSON.parse(readFileSync(projectPath, 'utf8'));
    const tags = project.tags || [];

    const hasScope = tags.some(t => t.startsWith('scope:'));
    const hasType = tags.some(t => t.startsWith('type:'));

    if (!hasScope || !hasType) {
      console.error(`✖ ${project.name} (${projectPath}) is missing required tags (scope:* and type:*)`);
      hasViolations = true;
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
