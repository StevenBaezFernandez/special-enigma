import fs from 'fs';
const files = [
    'apps/api/billing/app/jest.config.cts'
];
files.forEach(path => {
    if (fs.existsSync(path)) {
        let content = fs.readFileSync(path, 'utf8');
        content = content.replace(/\\\./g, '.');
        fs.writeFileSync(path, content);
    }
});
