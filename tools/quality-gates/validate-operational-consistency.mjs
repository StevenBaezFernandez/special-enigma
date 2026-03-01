#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { globSync } from 'glob';

const errors = [];

const packageJsonPath = 'package.json';
if (!existsSync(packageJsonPath)) {
  console.error('✖ package.json not found.');
  process.exit(1);
}

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const scripts = packageJson.scripts ?? {};
const scriptNames = new Set(Object.keys(scripts));

const nxJsonPath = 'nx.json';
if (!existsSync(nxJsonPath)) {
  errors.push('nx.json not found.');
} else {
  const nxJson = JSON.parse(readFileSync(nxJsonPath, 'utf8'));
  const defaultProject = nxJson.defaultProject;
  if (!defaultProject || typeof defaultProject !== 'string') {
    errors.push('nx.json defaultProject is missing or invalid.');
  } else {
    const projectNames = new Set(
      globSync('{apps,libs}/**/project.json', { nodir: true }).map((file) => JSON.parse(readFileSync(file, 'utf8')).name)
    );
    if (!projectNames.has(defaultProject)) {
      errors.push(`nx.json defaultProject '${defaultProject}' does not exist in project.json files.`);
    }
  }
}

function validateNpmRunCommandsInFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const matches = [...content.matchAll(/npm run ([a-zA-Z0-9:_-]+)/g)];
  for (const [, command] of matches) {
    if (!scriptNames.has(command)) {
      errors.push(`${filePath} references npm script '${command}' but it is not defined in package.json.`);
    }
  }
}

for (const workflowPath of globSync('.github/workflows/*.{yml,yaml}', { nodir: true })) {
  validateNpmRunCommandsInFile(workflowPath);
}

const workflowFiles = globSync('.github/workflows/*.{yml,yaml}', { nodir: true });
if (workflowFiles.length === 0) {
  errors.push('No CI workflow files found under .github/workflows.');
}

for (const docPath of ['README.md', 'CONTRIBUTING.md', 'docs/nx-governance.md']) {
  if (existsSync(docPath)) validateNpmRunCommandsInFile(docPath);
}

if (Object.keys(scripts).length === 0) {
  errors.push('package.json has no scripts; governance checks cannot be enforced.');
}

const projectFiles = globSync('{apps,libs}/**/project.json', { nodir: true });
if (projectFiles.length === 0) {
  errors.push('No project.json files discovered under apps/ and libs/.');
} else {
  const activeScopes = new Set();
  for (const projectFile of projectFiles) {
    const project = JSON.parse(readFileSync(projectFile, 'utf8'));
    for (const tag of project.tags ?? []) {
      if (tag.startsWith('scope:')) activeScopes.add(tag);
    }
  }

  if (activeScopes.has('scope:fixed')) {
    errors.push("Legacy scope 'scope:fixed' detected. Use canonical scope 'scope:fixed-assets'.");
  }

  const eslintPath = 'eslint.config.mjs';
  if (!existsSync(eslintPath)) {
    errors.push('eslint.config.mjs not found; cannot validate scope depConstraints coverage.');
  } else {
    const eslintContent = readFileSync(eslintPath, 'utf8');
    const constrainedScopes = new Set(
      [...eslintContent.matchAll(/sourceTag:\s*'scope:([a-z0-9-]+)'/g)].map(([, scope]) => `scope:${scope}`)
    );

    const uncoveredScopes = [...activeScopes].filter((scope) => !constrainedScopes.has(scope)).sort();
    if (uncoveredScopes.length > 0) {
      errors.push(`Scopes without depConstraints in eslint.config.mjs: ${uncoveredScopes.join(', ')}`);
    }
  }
}

if (errors.length > 0) {
  console.error('❌ Operational consistency validation failed:\n');
  for (const error of errors) {
    console.error(` - ${error}`);
  }
  process.exit(1);
}

console.log('✅ Operational consistency validation passed.');
