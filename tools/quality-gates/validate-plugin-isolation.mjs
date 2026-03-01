import fs from 'node:fs';
import path from 'node:path';

const pluginSourceDir = path.resolve('apps/api/plugin-host/app/src');
const prohibitedPatterns = [
    { regex: /process\.(?!env|exit)/g, reason: 'Direct access to "process" object (except process.env/exit) is prohibited in plugin host' },
    { regex: /globalThis/g, reason: '"globalThis" access must be strictly gated/monitored' },
    { regex: /require\(/g, reason: 'Dynamic "require" is prohibited in plugin runtime context' },
    { regex: /eval\((?!['"]|check\.pattern)/g, reason: '"eval" is prohibited for security' }
];

let violations = 0;

function walk(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(file => {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
            walk(filepath, callback);
        } else if (file.endsWith('.ts') && !file.endsWith('.spec.ts')) {
            callback(filepath);
        }
    });
}

console.log(`Checking Plugin Host Sandbox Hardening in: ${pluginSourceDir}`);

walk(pluginSourceDir, (file) => {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, index) => {
        // Skip heuristic check pattern itself in the source
        if (line.includes('pattern: /eval\\(/')) return;

        for (const pattern of prohibitedPatterns) {
            if (pattern.regex.test(line)) {
                console.error(`[VIOLATION] ${pattern.reason} in ${file}:${index + 1}`);
                console.error(`  > ${line.trim()}`);
                violations++;
            }
        }
    });
});

if (violations > 0) {
    console.error(`Found ${violations} sandbox hardening violations.`);
    process.exit(1);
} else {
    console.log('Plugin Host Sandbox Hardening check passed.');
}
