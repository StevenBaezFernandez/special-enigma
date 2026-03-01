#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const domainsRoot = 'libs/domain';
const allDomains = readdirSync(domainsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

function parseCsv(value) {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseDomainJustifications(value) {
  return (value ?? '')
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce((acc, item) => {
      const [domain, ...reasonParts] = item.split(/[=:]/);
      if (!domain) return acc;
      acc.set(domain.trim(), reasonParts.join(':').trim());
      return acc;
    }, new Map());
}

const excludedDomains = parseCsv(process.env.ARCH_BOUNDARY_EXCLUDED_DOMAINS);
const excludedSet = new Set(excludedDomains);
const defaultGoverned = allDomains.filter((domain) => !excludedSet.has(domain));
const strictLayerDomains = new Set(
  allDomains.filter(
    (domain) =>
      existsSync(join(domainsRoot, domain, 'domain')) &&
      existsSync(join(domainsRoot, domain, 'application'))
  )
);
const governedDomains = parseCsv(process.env.ARCH_BOUNDARY_DOMAINS ?? defaultGoverned.join(','));
const governedSet = new Set(governedDomains);
const unknownExcluded = excludedDomains.filter((domain) => !allDomains.includes(domain));
const uncoveredDomains = allDomains.filter((domain) => !governedSet.has(domain));
const exclusionJustifications = parseDomainJustifications(process.env.ARCH_BOUNDARY_EXCLUDED_JUSTIFICATIONS);
const unjustifiedDomains = uncoveredDomains.filter((domain) => !exclusionJustifications.get(domain));

const checks = [];

function addSearchCheck(name, command) {
  checks.push({ name, command });
}

if (unknownExcluded.length > 0) {
  checks.push({
    name: 'Excluded domains must exist under libs/domain',
    customError: `Unknown excluded domains: ${unknownExcluded.join(', ')}`,
  });
}

for (const domain of allDomains) {
  if (!governedSet.has(domain)) continue;

  const base = join(domainsRoot, domain);
  const domainSrc = join(base, 'domain/src');
  const appUseCases = join(base, 'application/src/lib/use-cases');

  if (strictLayerDomains.has(domain) && existsSync(domainSrc)) {
    addSearchCheck(
      `[${domain}] No framework imports in domain layer`,
      `rg --line-number --glob '${domainSrc}/**/*.ts' "@nestjs/|@mikro-orm/|class-validator|rxjs"`
    );
  }

  if (strictLayerDomains.has(domain) && existsSync(appUseCases)) {
    addSearchCheck(
      `[${domain}] No HTTP exceptions in application use-cases`,
      `rg --line-number --glob '${appUseCases}/**/*.ts' "import\\\\s+\\\\{[^}]*\\\\b(NotFoundException|BadRequestException|ForbiddenException|UnauthorizedException|ConflictException)\\\\b[^}]*\\\\}\\\\s+from '@nestjs/common'"`
    );
    addSearchCheck(
      `[${domain}] No MikroORM imports in application use-cases`,
      `rg --line-number --glob '${appUseCases}/**/*.ts' "@mikro-orm/"`
    );
  }

  const appPath = `apps/api/${domain}/app/src/app`;
  if (existsSync(appPath) && existsSync(join(base, 'presentation'))) {
    addSearchCheck(
      `[${domain}] App shell must not define duplicate presentation artifacts`,
      `rg --line-number --glob '${appPath}/**/*.ts' "@Resolver\\\\(|@InputType\\\\(|@ObjectType\\\\("`
    );
  }

  if (existsSync(appPath) && existsSync(join(base, 'infrastructure'))) {
    addSearchCheck(
      `[${domain}] App shell must not contain infrastructure adapters`,
      `rg --line-number --glob '${appPath}/**/*.ts' "class\\\\s+.*(Gateway|Repository|Adapter)"`
    );
  }

  for (const layer of ['domain', 'application', 'infrastructure', 'presentation', 'contracts']) {
    const projectJsonPath = join(base, layer, 'project.json');
    if (!existsSync(projectJsonPath)) continue;
    const project = JSON.parse(readFileSync(projectJsonPath, 'utf8'));
    const tags = project.tags ?? [];
    if (!tags.includes(`scope:${domain}`)) {
      checks.push({
        name: `[${domain}] ${layer} project must include scope:${domain}`,
        customError: `${projectJsonPath}: missing required tag scope:${domain}`,
      });
    }
  }
}

if (unjustifiedDomains.length > 0) {
  checks.push({
    name: 'Uncovered domains must be explicitly justified',
    customError:
      `Missing ARCH_BOUNDARY_EXCLUDED_JUSTIFICATIONS for: ${unjustifiedDomains.join(', ')}. ` +
      'Use format "domain=reason;other-domain=reason" for temporary exclusions.',
  });
}

let hasViolations = false;
for (const check of checks) {
  if (check.customError) {
    hasViolations = true;
    console.error(`✖ ${check.name}`);
    console.error(check.customError);
    console.error('');
    continue;
  }

  try {
    const output = execSync(check.command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    if (output) {
      hasViolations = true;
      console.error(`✖ ${check.name}`);
      console.error(output);
      console.error('');
    }
  } catch (error) {
    const output = error.stdout?.toString().trim();
    if (!output) continue;
    hasViolations = true;
    console.error(`✖ ${check.name}`);
    console.error(output);
    console.error('');
  }
}

console.log(`ℹ Detected domains: ${allDomains.join(', ')}`);
console.log(`ℹ Governed domains: ${governedDomains.join(', ') || '(none)'}`);
if (uncoveredDomains.length > 0) {
  console.log(
    `ℹ Uncovered domains (temporary exclusions): ${uncoveredDomains
      .map((domain) => `${domain}${exclusionJustifications.get(domain) ? ` (${exclusionJustifications.get(domain)})` : ''}`)
      .join(', ')}`
  );
}

if (hasViolations) process.exit(1);
console.log('✔ Architecture boundary checks passed');
