import fs from 'fs';
import path from 'path';

const tsconfigPath = 'tsconfig.base.json';
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
const paths = tsconfig.compilerOptions.paths;

let errors = 0;

console.log('🔍 Checking Nx registration for all paths in tsconfig.base.json...');

for (const alias in paths) {
  if (alias.startsWith('@virteex/')) {
    const relativePath = paths[alias][0].replace('/src/index.ts', '');
    const projectJsonPath = path.join(relativePath, 'project.json');

    if (!fs.existsSync(projectJsonPath)) {
      console.error(`❌ Library "${alias}" at "${relativePath}" is missing a project.json file.`);
      errors++;
    }
  }
}

if (errors > 0) {
  console.error(`\nFound ${errors} missing project.json registrations.`);
  process.exit(1);
} else {
  console.log('\n✅ All @virteex/* libraries are correctly registered in Nx.');
  process.exit(0);
}
