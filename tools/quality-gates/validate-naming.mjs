import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const searchDirs = ['apps', 'libs'];
let hasViolations = false;

function validate(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  if (entries.some(e => e.name === 'project.json')) {
    const projectPath = join(dir, 'project.json');
    const project = JSON.parse(readFileSync(projectPath, 'utf8'));
    const name = project.name;

    if (dir.includes('apps/api/') && !name.startsWith('api-')) {
       console.error(`✖ API App ${name} at ${dir} must start with api-`);
       hasViolations = true;
    }
    if (dir.includes('apps/web/') && !name.startsWith('web-')) {
       console.error(`✖ Web App ${name} at ${dir} must start with web-`);
       hasViolations = true;
    }
    if (dir.includes('libs/domain/') && !name.startsWith('domain-')) {
       console.error(`✖ Domain Lib ${name} at ${dir} must start with domain-`);
       hasViolations = true;
    }
  }
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
      validate(join(dir, entry.name));
    }
  }
}

searchDirs.forEach(d => existsSync(d) && validate(d));
if (hasViolations) process.exit(1);
console.log('✔ Naming validation passed');
