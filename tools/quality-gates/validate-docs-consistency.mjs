import fs from 'node:fs';
import path from 'node:path';

const baseDir = process.cwd();
const docsDir = path.join(baseDir, 'docs');

function checkLinksInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const linkRegex = /\[.*?\]\((.*?)\)/g;
    let match;
    const brokenLinks = [];

    while ((match = linkRegex.exec(content)) !== null) {
        const link = match[1];
        if (link.startsWith('http') || link.startsWith('#')) continue;

        const linkPath = path.resolve(path.dirname(filePath), link);
        if (!fs.existsSync(linkPath)) {
            brokenLinks.push(link);
        }
    }
    return brokenLinks;
}

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(file => {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
            walk(filepath, callback);
        } else if (file.endsWith('.md')) {
            callback(filepath);
        }
    });
}

console.log('Validating documentation consistency...');
let totalBroken = 0;

const filesToCheck = [path.join(baseDir, 'README.md'), path.join(baseDir, 'AGENTS.md')];
walk(docsDir, (fp) => filesToCheck.push(fp));

for (const file of filesToCheck) {
    if (!fs.existsSync(file)) continue;
    const broken = checkLinksInFile(file);
    if (broken.length > 0) {
        console.error(`Broken links in ${path.relative(baseDir, file)}:`);
        broken.forEach(l => console.error(` - ${l}`));
        totalBroken += broken.length;
    }
}

// Check for required runbooks in README or RUNBOOKS.md
const runbooksFile = path.join(baseDir, 'RUNBOOKS.md');
if (fs.existsSync(runbooksFile)) {
    const content = fs.readFileSync(runbooksFile, 'utf8');
    const mentions = content.match(/docs\/operations\/[a-zA-Z0-9\-/]+\.md/g) || [];
    for (const mention of mentions) {
        if (!fs.existsSync(path.join(baseDir, mention))) {
            console.error(`Required runbook missing: ${mention}`);
            totalBroken++;
        }
    }
}

if (totalBroken > 0) {
    console.error(`Found ${totalBroken} consistency issues in documentation.`);
    process.exit(1);
}

console.log('Documentation consistency check passed.');
