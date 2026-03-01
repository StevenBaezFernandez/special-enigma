#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { globSync } from 'glob';

const backendRoots = [join('apps', 'api'), join('apps', 'worker')];
const supportedExecutors = new Set(['@nx/jest:jest', '@nx/vitest:test']);
const policyPath = join('config', 'governance', 'backend-test-policy.json');
const policy = existsSync(policyPath) ? JSON.parse(readFileSync(policyPath, 'utf8')) : { allowMissingTestTarget: {} };
const allowMissingTestTarget = new Map(Object.entries(policy.allowMissingTestTarget ?? {}));
const inspectedProjects = [];
const discoveredProjects = new Set();
const errors = [];

function findProjectJsonFiles(rootDir) {
  const projectJsonFiles = [];

  function walk(currentDir) {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;

      const dirPath = join(currentDir, entry.name);
      const projectJsonPath = join(dirPath, 'project.json');
      if (existsSync(projectJsonPath)) {
        projectJsonFiles.push(projectJsonPath);
        continue;
      }

      walk(dirPath);
    }
  }

  walk(rootDir);
  return projectJsonFiles;
}

for (const backendRoot of backendRoots) {
  if (!existsSync(backendRoot)) {
    errors.push(`Backend root '${backendRoot}' does not exist.`);
    continue;
  }

  const projectJsonFiles = findProjectJsonFiles(backendRoot);
  for (const projectJsonPath of projectJsonFiles) {
    const project = JSON.parse(readFileSync(projectJsonPath, 'utf8'));

    if (project.projectType !== 'application') continue;
    if ((project.tags ?? []).includes('type:e2e')) continue;

    const projectName = project.name ?? projectJsonPath;
    inspectedProjects.push(projectName);
    discoveredProjects.add(projectName);

    const testTarget = project.targets?.test;
    if (!testTarget || typeof testTarget !== 'object' || Array.isArray(testTarget)) {
      if (allowMissingTestTarget.has(projectName)) continue;
      errors.push(`${projectJsonPath}: missing test target.`);
      continue;
    }

    const executor = testTarget.executor;
    if (executor && typeof executor !== 'string') {
      errors.push(`${projectJsonPath}: test target executor must be a string when defined.`);
      continue;
    }

    if (executor && !supportedExecutors.has(executor)) {
      errors.push(
        `${projectJsonPath}: unsupported test executor '${executor}'. Supported executors: ${[
          ...supportedExecutors,
        ].join(', ')}.`
      );
      continue;
    }

    const sourceRoot = project.sourceRoot;
    const hasTests =
      typeof sourceRoot === 'string' &&
      globSync(`${sourceRoot}/**/*.{spec,test}.ts`, { nodir: true }).length > 0;
    const passWithNoTests = testTarget.options?.passWithNoTests === true;

    if (!hasTests && !passWithNoTests) {
      errors.push(
        `${projectJsonPath}: no test files found under '${sourceRoot ?? '<sourceRoot>'}' and options.passWithNoTests is not true.`
      );
    }

    if (executor === '@nx/jest:jest') {
      const jestConfigPath = testTarget.options?.jestConfig;
      if (!jestConfigPath || typeof jestConfigPath !== 'string') {
        errors.push(`${projectJsonPath}: Jest test target must include options.jestConfig.`);
      } else if (!existsSync(jestConfigPath)) {
        errors.push(`${projectJsonPath}: Jest config file '${jestConfigPath}' does not exist.`);
      }
    }
  }
}

for (const [projectName, reason] of allowMissingTestTarget.entries()) {
  if (!discoveredProjects.has(projectName)) {
    errors.push(`backend-test-policy references unknown project '${projectName}' (${reason}).`);
  }
}

if (inspectedProjects.length === 0) {
  errors.push('No backend application projects were inspected. Ensure project discovery covers apps/api and apps/worker.');
}

if (errors.length > 0) {
  console.error('❌ Backend test target validation failed:\n');
  for (const error of errors) {
    console.error(` - ${error}`);
  }
  process.exit(1);
}

console.log(`✅ Backend test target validation passed (${inspectedProjects.length} projects inspected).`);
