import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['apps', 'libs'];
const requiredPrefixes = ['scope:', 'type:', 'platform:', 'criticality:'];
const gradualMode = (process.env.TAG_POLICY_MODE ?? 'warn').toLowerCase();
const supportedModes = new Set(['warn', 'error']);

const allowedValues = {
  type: new Set(['app', 'application', 'domain', 'infrastructure', 'presentation', 'contract', 'ui', 'util', 'kernel', 'e2e', 'lib']),
  platform: new Set(['agnostic', 'backend', 'api', 'web', 'mobile', 'server', 'nest', 'identity', 'fiscal', 'plugin-host', 'scheduler', 'e2e']),
  criticality: new Set(['high', 'medium', 'low']),
  compliance: new Set([
    'fiscal-critical',
    'sensitive-personal',
    'encryption-at-rest',
    'pii-hashed',
    'soc2',
    'gdpr',
    'lgpd',
    'pci-dss',
    'hipaa',
  ]),
  'tenant-mode': new Set(['shared-schema', 'schema-per-tenant', 'database-per-tenant']),
  region: new Set(['global', 'us', 'latam', 'br', 'mx', 'cl', 'co']),
};

const tagFormatByFamily = {
  scope: /^[a-z0-9][a-z0-9-]*$/,
  type: /^[a-z0-9][a-z0-9-]*$/,
  platform: /^[a-z0-9][a-z0-9-]*$/,
  criticality: /^(high|medium|low)$/,
  compliance: /^[a-z0-9][a-z0-9-]*$/,
  'tenant-mode': /^[a-z0-9][a-z0-9-]*$/,
  region: /^[a-z0-9][a-z0-9-]*$/,
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
const warnings = [];

if (!supportedModes.has(gradualMode)) {
  errors.push(`Invalid TAG_POLICY_MODE='${gradualMode}'. Allowed values: [warn, error].`);
}

function reportPolicyViolation(message) {
  if (gradualMode === 'error') {
    errors.push(message);
    return;
  }

  warnings.push(message);
}

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

    for (const [family, values] of parsedTags.entries()) {
      const format = tagFormatByFamily[family];
      for (const value of values) {
        if (!value) {
          errors.push(`${file}: empty value for tag family '${family}' is not allowed.`);
          continue;
        }

        if (format && !format.test(value)) {
          errors.push(`${file}: invalid format for ${family}:${value}. Use lowercase kebab-case values.`);
        }
      }
    }

    const legacyTags = tags.filter((tag) => tag.startsWith('domain:'));
    if (legacyTags.length > 0) {
      errors.push(`${file}: legacy tags are not allowed [${legacyTags.join(', ')}]`);
    }

    for (const [family, accepted] of Object.entries(allowedValues)) {
      const values = parsedTags.get(family) ?? [];
      for (const value of values) {
        if (!accepted.has(value)) {
          const message =
            `${file}: invalid ${family} tag value '${value}'. Allowed values: [${[...accepted].join(', ')}]`
          if (family === 'compliance' || family === 'tenant-mode' || family === 'region') {
            reportPolicyViolation(message);
          } else {
            errors.push(message);
          }
        }
      }
    }

    const criticalityValues = parsedTags.get('criticality') ?? [];
    const requiresExtendedFamilies = criticalityValues.includes('high');

    if (requiresExtendedFamilies) {
      for (const family of ['compliance', 'tenant-mode', 'region']) {
        const familyValues = parsedTags.get(family) ?? [];
        if (familyValues.length === 0) {
          reportPolicyViolation(
            `${file}: criticality:high requires ${family}:* (non-empty). Set TAG_POLICY_MODE=error to enforce as hard error.`
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

if (warnings.length > 0) {
  console.warn('⚠️ Project tag validation warnings:\n');
  for (const warning of warnings) {
    console.warn(` - ${warning}`);
  }

  if (gradualMode === 'warn') {
    console.warn('\nℹ️ Gradual mode active (TAG_POLICY_MODE=warn). Set TAG_POLICY_MODE=error to enforce new policy as blocking.');
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
