#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

let hasViolations = false;

function validateDomainPurity() {
  const domainsRoot = 'libs/domain';
  if (!existsSync(domainsRoot)) return;

  const domains = readdirSync(domainsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const domain of domains) {
    const domainSrc = join(domainsRoot, domain, 'domain/src');
    if (existsSync(domainSrc)) {
      try {
        const output = execSync(
          `rg --line-number --glob '/**/*.ts' --glob '!/**/*.spec.ts' "@nestjs/|@mikro-orm/|class-validator" ${domainSrc}`,
          { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
        ).trim();

        if (output) {
          console.error(`✖ [${domain}] Forbidden framework imports found in domain layer:`);
          console.error(output);
          hasViolations = true;
        }
      } catch (error) {
        // rg returns exit code 1 if no matches are found, which is fine
      }
    }

    const appUseCases = join(domainsRoot, domain, 'application/src/lib/use-cases');
    if (existsSync(appUseCases)) {
      try {
        const output = execSync(
            `rg --line-number --glob '/**/*.ts' --glob '!/**/*.spec.ts' "import\\\\s+\\\\{[^}]*\\\\b(NotFoundException|BadRequestException|ForbiddenException|UnauthorizedException|ConflictException)\\\\b[^}]*\\\\}\\\\s+from '@nestjs/common'" ${appUseCases}`,
            { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
          ).trim();

          if (output) {
            console.error(`✖ [${domain}] HTTP exceptions found in application use-cases:`);
            console.error(output);
            hasViolations = true;
          }
      } catch (error) {}
    }
  }
}

function validateSharedUi() {
    const sharedUiModels = 'libs/shared/ui/src/lib/core/models';
    if (existsSync(sharedUiModels)) {
        const files = readdirSync(sharedUiModels);
        const businessModels = files.filter(f => !['user.ts', 'fiscal-region.model.ts', 'finance.ts'].includes(f));
        if (businessModels.length > 0) {
            console.error(`✖ Business models found in shared/ui: ${businessModels.join(', ')}`);
            console.error('Move these to their respective domain contracts.');
            hasViolations = true;
        }
    }
}

console.log('Running structural validation...');
validateDomainPurity();
validateSharedUi();

if (hasViolations) {
  process.exit(1);
} else {
  console.log('✔ Structural validation passed');
}
