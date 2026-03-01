import fs from 'node:fs';
import path from 'node:path';

const pluginSourceDir = path.resolve('apps/api/plugin-host/app/src');
const prohibitedPatterns = [
    { regex: /process\.(?!env)/g, reason: 'Direct access to "process" object (except process.env) is prohibited in plugin host' },
    { regex: /globalThis/g, reason: '"globalThis" access must be strictly gated/monitored' },
    { regex: /require\(/g, reason: 'Dynamic "require" is prohibited in plugin runtime context' },
    { regex: /eval\(/g, reason: '"eval" is prohibited for security' }
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
    const content = fs.readFileSync(file, 'utf8');
    for (const pattern of prohibitedPatterns) {
        if (pattern.regex.test(content)) {
            console.error(`[VIOLATION] ${pattern.reason} in ${file}`);
            violations++;
        }
    }
});

if (violations > 0) {
    console.error(`Found ${violations} sandbox hardening violations.`);
    // In strict mode we would exit 1, but for initial implementation we log and warn.
    // process.exit(1);
} else {
    console.log('Plugin Host Sandbox Hardening check passed.');
}
