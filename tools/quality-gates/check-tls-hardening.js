#!/usr/bin/env node
const { readFileSync, readdirSync, statSync, existsSync } = require('fs');
const { join } = require('path');

const FORBIDDEN_PATTERNS = [
  {
    regex: /rejectUnauthorized:\s*false/g,
    reason: 'Hardcoded rejectUnauthorized: false is forbidden in productive code.'
  },
  {
    regex: /process\.env\[['"]AUDIT_HMAC_SECRET['"]\]\s*\|\|\s*['"]audit-secret-fail-safe['"]/g,
    reason: 'Unsafe fallback for AUDIT_HMAC_SECRET detected.'
  },
  {
      regex: /process\.env\[['"]DB_PASSWORD['"]\]\s*\|\|\s*['"]password['"]/g,
      reason: 'Unsafe fallback for DB_PASSWORD detected.'
  }
];

function getFiles(dir, allFiles = []) {
  if (!existsSync(dir)) return allFiles;
  const files = readdirSync(dir);
  for (const file of files) {
    const name = join(dir, file);
    if (statSync(name).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        getFiles(name, allFiles);
      }
    } else if (name.endsWith('.ts') && !name.includes('.spec.ts') && !name.includes('.test.ts')) {
       allFiles.push(name);
    }
  }
  return allFiles;
}

let errors = 0;
const productiveFiles = [...getFiles('apps'), ...getFiles('libs')];

for (const file of productiveFiles) {
  const content = readFileSync(file, 'utf8');
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.regex.test(content)) {
      console.error(`❌ [HARDENING FAILURE] ${file}: ${pattern.reason}`);
      errors++;
    }
  }
}

if (errors > 0) {
  process.exit(1);
}

console.log('✅ TLS and Secret hardening check passed.');
