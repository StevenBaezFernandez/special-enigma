#!/usr/bin/env node
import { execSync } from 'node:child_process';

const scopedGlobs = [
  'libs/domains/inventory/**',
  'libs/domains/fixed-assets/**',
];

const checks = [
  {
    name: 'No MikroORM imports in Inventory/Fixed-Assets domain layers',
    command: `rg --line-number --glob 'libs/domains/{inventory,fixed-assets}/domain/src/**/*.ts' "@mikro-orm/"`,
  },
  {
    name: 'No NestJS imports in Inventory/Fixed-Assets domain layers',
    command: `rg --line-number --glob 'libs/domains/{inventory,fixed-assets}/domain/src/**/*.ts' "@nestjs/"`,
  },
  {
    name: 'No NestJS HTTP exceptions in Inventory/Fixed-Assets application use-cases',
    command: `rg --line-number --glob 'libs/domains/{inventory,fixed-assets}/application/src/lib/use-cases/**/*.ts' "import\s+\{[^}]*\b(NotFoundException|BadRequestException|ForbiddenException|UnauthorizedException|ConflictException)\b[^}]*\}\s+from \'@nestjs/common\'"`,
  },
  {
    name: 'No Inventory application module importing inventory infrastructure module',
    command: "rg --line-number \"InventoryInfrastructureModule\" libs/domains/inventory/application/src",
  },
];

let hasViolations = false;
for (const check of checks) {
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

if (hasViolations) process.exit(1);
console.log('✔ Architecture boundary checks passed for inventory/fixed-assets');
