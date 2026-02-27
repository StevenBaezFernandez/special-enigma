import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['apps', 'libs'];
const requiredPrefixes = ['scope:', 'type:', 'platform:', 'criticality:'];

const allowedValues = {
  type: new Set(['app', 'application', 'domain', 'infrastructure', 'presentation', 'contract', 'ui', 'util', 'kernel', 'e2e', 'lib']),
  platform: new Set(['agnostic', 'backend', 'api', 'web', 'mobile', 'server', 'nest', 'identity', 'fiscal', 'plugin-host', 'scheduler', 'e2e']),
  criticality: new Set(['high', 'medium', 'low']),
};

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue;
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      yield* walk(fullPath);
    } else if (entry === 'project.json') {
      yield fullPath;
    }
  }
}

function parseTags(tags) {
  const parsed = new Map();
  for (const tag of tags) {
    if (!tag.includes(':')) continue;
    const [family, value] = tag.split(':', 2);
    if (!parsed.has(family)) parsed.set(family, []);
    parsed.get(family).push(value);
  }
  return parsed;
}

const errors = [];
for (const root of roots) {
  for (const file of walk(root)) {
    const project = JSON.parse(readFileSync(file, 'utf8'));
    const tags = project.tags ?? [];
    const parsedTags = parseTags(tags);

    const missingRequired = requiredPrefixes.filter((prefix) => !tags.some((tag) => tag.startsWith(prefix)));
    if (missingRequired.length > 0) {
      errors.push(`${file}: missing required tag families [${missingRequired.join(', ')}]`);
    }

    const malformedTags = tags.filter((tag) => !tag.includes(':'));
    if (malformedTags.length > 0) {
      errors.push(`${file}: malformed tags [${malformedTags.join(', ')}]`);
    }

    const legacyTags = tags.filter((tag) => tag.startsWith('domain:'));
    if (legacyTags.length > 0) {
      errors.push(`${file}: legacy tags are not allowed [${legacyTags.join(', ')}]`);
    }

    for (const [family, accepted] of Object.entries(allowedValues)) {
      const values = parsedTags.get(family) ?? [];
      for (const value of values) {
        if (!accepted.has(value)) {
          errors.push(
            `${file}: invalid ${family} tag value '${value}'. Allowed values: [${[...accepted].join(', ')}]`
          );
        }
      }
    }

    const typeValues = parsedTags.get('type') ?? [];
    if (project.projectType === 'application' && !typeValues.includes('app') && !typeValues.includes('e2e')) {
      errors.push(`${file}: deployable projects (projectType=application) must include type:app (or type:e2e for test apps).`);
    }

    if (project.projectType === 'library' && typeValues.includes('app')) {
      errors.push(`${file}: library projects must not be tagged as type:app.`);
    }
  }
}

if (errors.length > 0) {
  console.error('❌ Project tag validation failed:\n');
  for (const error of errors) {
    console.error(` - ${error}`);
  }
  process.exit(1);
}

console.log('✅ Project tag validation passed.');
