import fs from 'node:fs';
import path from 'node:path';

const baseDir = process.cwd();
const docsDir = path.join(baseDir, 'docs');
const allowedMissingByDesign = new Set(['mailto:security@virteex.com']);

function normalizeRelativeLink(rawLink) {
  const [linkWithoutQuery] = rawLink.split('?');
  const [linkWithoutHash] = linkWithoutQuery.split('#');
  return linkWithoutHash.trim();
}

function fileExistsWithMarkdownFallback(targetPath) {
  if (fs.existsSync(targetPath)) return true;
  if (path.extname(targetPath) === '') {
    return (
      fs.existsSync(`${targetPath}.md`) ||
      fs.existsSync(path.join(targetPath, 'README.md'))
    );
  }
  return false;
}

function resolveRepoLink(filePath, link) {
  if (link.startsWith('/')) {
    return path.join(baseDir, link.slice(1));
  }
  return path.resolve(path.dirname(filePath), link);
}

function checkLinksInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const markdownLinkRegex = /\[[^\]]*\]\(([^)]+)\)/g;
  const brokenLinks = [];

  for (const match of content.matchAll(markdownLinkRegex)) {
    const rawLink = match[1].trim();
    if (!rawLink) continue;
    if (allowedMissingByDesign.has(rawLink)) continue;
    if (
      rawLink.startsWith('http://') ||
      rawLink.startsWith('https://') ||
      rawLink.startsWith('#') ||
      rawLink.startsWith('mailto:')
    ) {
      continue;
    }

    const cleanedLink = normalizeRelativeLink(rawLink);
    if (!cleanedLink) continue;

    const linkPath = resolveRepoLink(filePath, cleanedLink);
    if (!fileExistsWithMarkdownFallback(linkPath)) {
      brokenLinks.push(rawLink);
    }
  }

  return brokenLinks;
}

function walk(dir, callback) {
  fs.readdirSync(dir).forEach((file) => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walk(filepath, callback);
    } else if (file.endsWith('.md')) {
      callback(filepath);
    }
  });
}

function validateCommercialMatrixCoverage() {
  const matrixPath = path.join(
    baseDir,
    'config/readiness/commercial-eligibility.matrix.json',
  );
  const moduleMatrixPath = path.join(
    baseDir,
    'docs/commercial/module-maturity-matrix.md',
  );
  if (!fs.existsSync(matrixPath) || !fs.existsSync(moduleMatrixPath)) {
    return [];
  }

  const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
  const moduleDoc = fs.readFileSync(moduleMatrixPath, 'utf8');
  const issues = [];

  for (const moduleName of Object.keys(matrix.modules ?? {})) {
    const moduleRegex = new RegExp(`\\|\\s*${moduleName}\\s*\\|`, 'i');
    if (!moduleRegex.test(moduleDoc)) {
      issues.push(
        `Module '${moduleName}' exists in commercial matrix but is missing from docs/commercial/module-maturity-matrix.md`,
      );
    }
  }

  return issues;
}

console.log('Validating documentation consistency...');
let totalBroken = 0;

const filesToCheck = [
  path.join(baseDir, 'README.md'),
  path.join(baseDir, 'AGENTS.md'),
];
walk(docsDir, (fp) => filesToCheck.push(fp));

for (const file of filesToCheck) {
  if (!fs.existsSync(file)) continue;
  const broken = checkLinksInFile(file);
  if (broken.length > 0) {
    console.error(`Broken links in ${path.relative(baseDir, file)}:`);
    broken.forEach((l) => console.error(` - ${l}`));
    totalBroken += broken.length;
  }
}

const coverageIssues = validateCommercialMatrixCoverage();
for (const issue of coverageIssues) {
  console.error(issue);
  totalBroken += 1;
}

if (totalBroken > 0) {
  console.error(`Found ${totalBroken} consistency issues in documentation.`);
  process.exit(1);
}

console.log('Documentation consistency check passed.');
