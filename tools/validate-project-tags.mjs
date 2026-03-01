#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const searchDirs = ['apps', 'libs'];
const policyMode = process.env.TAG_POLICY_MODE || 'error';
const catalogPath = join('config', 'governance', 'tag-catalog.json');

if (!existsSync(catalogPath)) {
  console.error(`✖ Missing tag catalog: ${catalogPath}`);
  process.exit(1);
}

const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const requiredFamilies = catalog.requiredFamilies ?? [];
const allowedFamilies = new Set(catalog.allowedFamilies ?? []);
const criticalityHighRequires = catalog.criticalityHighRequires ?? [];
const allowedValues = Object.fromEntries(
  Object.entries(catalog.allowedValues ?? {}).map(([family, values]) => [family, new Set(values)])
);

let hasViolations = false;
let inspectedProjects = 0;

function report(message) {
  if (policyMode === 'error') {
    console.error(`✖ ${message}`);
    hasViolations = true;
  } else {
    console.warn(`⚠ ${message}`);
  }
}

function validateProject(projectPath) {
  const project = JSON.parse(readFileSync(projectPath, 'utf8'));
  const projectName = project.name ?? projectPath;
  const tags = project.tags ?? [];
  inspectedProjects += 1;

  if (!Array.isArray(tags) || tags.length === 0) {
    report(`${projectName} (${projectPath}) must declare tags[] with governance families.`);
    return;
  }

  const missingFamilies = requiredFamilies.filter((family) => !tags.some((tag) => tag.startsWith(family)));
  if (missingFamilies.length > 0) {
    report(`${projectName} (${projectPath}) is missing required tags: ${missingFamilies.join(', ')}`);
  }

  for (const tag of tags) {
    if (!/^[a-z0-9-]+:[a-z0-9-]+$/.test(tag)) {
      report(`${projectName} (${projectPath}) tag '${tag}' must use lower-kebab format family:value.`);
      continue;
    }

    const [family, value] = tag.split(':');
    const familyPrefix = `${family}:`;
    if (!allowedFamilies.has(familyPrefix)) {
      report(`${projectName} (${projectPath}) tag family '${familyPrefix}' is not allowed by catalog.`);
      continue;
    }

    const allowedFamilyValues = allowedValues[family];
    if (allowedFamilyValues && !allowedFamilyValues.has(value)) {
      report(
        `${projectName} (${projectPath}) tag '${tag}' is not allowed. Allowed ${family}: ${[
          ...allowedFamilyValues,
        ].join(', ')}`
      );
    }
  }

  if (tags.includes('criticality:high')) {
    const missingHigh = criticalityHighRequires.filter((family) => !tags.some((tag) => tag.startsWith(family)));
    if (missingHigh.length > 0) {
      report(`${projectName} (${projectPath}) is missing criticality:high requirements: ${missingHigh.join(', ')}`);
    }
  }
}

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;

    const nextDir = join(dir, entry.name);
    const projectPath = join(nextDir, 'project.json');
    if (existsSync(projectPath)) {
      validateProject(projectPath);
      continue;
    }

    walk(nextDir);
  }
}

for (const dir of searchDirs) {
  if (existsSync(dir)) walk(dir);
}

if (inspectedProjects === 0) {
  console.error('✖ No project.json files were inspected under apps/ and libs/.');
  process.exit(1);
}

if (hasViolations) process.exit(1);
console.log(`✔ Project tags validation passed (${inspectedProjects} projects inspected)`);
