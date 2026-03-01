#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { globSync } from 'glob';

const projects = globSync('{apps,libs}/**/project.json', { nodir: true }).map((file) => JSON.parse(readFileSync(file, 'utf8')));
const scopes = new Set();
const types = new Set();

for (const project of projects) {
  for (const tag of project.tags ?? []) {
    if (tag.startsWith('scope:')) scopes.add(tag);
    if (tag.startsWith('type:')) types.add(tag);
  }
}

console.log('Governance scorecard');
console.log(`- Projects discovered: ${projects.length}`);
console.log(`- Active scopes (${scopes.size}): ${[...scopes].sort().join(', ')}`);
console.log(`- Active types (${types.size}): ${[...types].sort().join(', ')}`);
console.log('- Run npm run governance:check for enforceable consistency gates.');
