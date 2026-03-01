#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const backendAppsRoots = [join('apps', 'api'), join('apps', 'worker')];
const errors = [];

for (const backendAppsRoot of backendAppsRoots) {
  if (!existsSync(backendAppsRoot)) continue;

  for (const entry of readdirSync(backendAppsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    if (entry.name.endsWith('-e2e')) continue;

    const projectJsonPath = join(backendAppsRoot, entry.name, 'project.json');
    if (!existsSync(projectJsonPath)) continue;

    const project = JSON.parse(readFileSync(projectJsonPath, 'utf8'));
    const testTarget = project.targets?.test;

    if (!testTarget || typeof testTarget !== 'object' || Array.isArray(testTarget)) {
      errors.push(`${projectJsonPath}: missing test target.`);
      continue;
    }

    if (!testTarget.executor || typeof testTarget.executor !== 'string') {
      errors.push(`${projectJsonPath}: test target must define an executor.`);
    }

    const supportedExecutors = new Set(['@nx/jest:jest', '@nx/vitest:test']);
    if (testTarget.executor && !supportedExecutors.has(testTarget.executor)) {
      errors.push(
        `${projectJsonPath}: unsupported test executor '${testTarget.executor}'. Supported executors: ${[
          ...supportedExecutors,
        ].join(', ')}.`
      );
    }

    if (Object.keys(testTarget).length === 0) {
      errors.push(`${projectJsonPath}: test target cannot be an empty object.`);
      continue;
    }

    if (testTarget.executor === '@nx/jest:jest') {
      const jestConfigPath = testTarget.options?.jestConfig;
      if (!jestConfigPath || typeof jestConfigPath !== 'string') {
        errors.push(`${projectJsonPath}: Jest test target must include options.jestConfig.`);
      } else if (!existsSync(jestConfigPath)) {
        errors.push(`${projectJsonPath}: Jest config file '${jestConfigPath}' does not exist.`);
      }
    }

    if (testTarget.executor === '@nx/vitest:test') {
      const candidatePaths = ['vitest.config.ts', 'vitest.config.mts', 'vite.config.ts'].map((filename) =>
        join(backendAppsRoot, entry.name, filename)
      );

      if (!candidatePaths.some((candidatePath) => existsSync(candidatePath))) {
        errors.push(
          `${projectJsonPath}: Vitest test target requires a vitest/vite config file in ${join(
            backendAppsRoot,
            entry.name
          )}.`
        );
      }
    }
  }
}

if (errors.length > 0) {
  console.error('❌ Backend test target validation failed:\n');
  for (const error of errors) {
    console.error(` - ${error}`);
  }
  process.exit(1);
}

console.log('✅ Backend test target validation passed.');
