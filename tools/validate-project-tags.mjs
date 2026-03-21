import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const catalogPath = join(process.cwd(), 'config/governance/tag-catalog.json');
const catalog = JSON.parse(readFileSync(catalogPath, 'utf-8'));

function getProjectFiles(dir, allFiles = []) {
  const files = readdirSync(dir);
  for (const file of files) {
    const name = join(dir, file);
    if (statSync(name).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        getProjectFiles(name, allFiles);
      }
    } else if (file === 'project.json') {
      allFiles.push(name);
    }
  }
  return allFiles;
}

const projectFiles = getProjectFiles('.');
let errors = 0;

console.log(`🔍 Validating tags for ${projectFiles.length} projects...`);

for (const projectFile of projectFiles) {
  const project = JSON.parse(readFileSync(projectFile, 'utf-8'));
  const tags = project.tags || [];
  const projectName = project.name || projectFile;

  // 1. Check required families
  for (const requiredFamily of catalog.requiredFamilies) {
    if (!tags.some(tag => tag.startsWith(requiredFamily))) {
      console.error(`❌ [TAG ERROR] ${projectName}: Missing required tag family "${requiredFamily}"`);
      errors++;
    }
  }

  // 2. Check allowed values and families
  for (const tag of tags) {
    const [family, value] = tag.split(':');
    const familyWithColon = `${family}:`;

    if (!catalog.allowedFamilies.includes(familyWithColon)) {
      console.error(`❌ [TAG ERROR] ${projectName}: Tag family "${familyWithColon}" is not allowed.`);
      errors++;
      continue;
    }

    if (catalog.allowedValues[family] && !catalog.allowedValues[family].includes(value)) {
      console.error(`❌ [TAG ERROR] ${projectName}: Tag "${tag}" has an invalid value for family "${family}".`);
      errors++;
    }
  }

  // 3. Check criticality high requirements
  const isHighCriticality = tags.includes('criticality:high');
  if (isHighCriticality) {
    for (const requiredForHigh of catalog.criticalityHighRequires) {
      if (!tags.some(tag => tag.startsWith(requiredForHigh))) {
        console.error(`❌ [TAG ERROR] ${projectName}: High criticality project missing required tag "${requiredForHigh}"`);
        errors++;
      }
    }
  }
}

if (errors > 0) {
  console.error(`\nTotal tag validation errors: ${errors}`);
  process.exit(1);
}

console.log('✅ Project tags validation passed.');
