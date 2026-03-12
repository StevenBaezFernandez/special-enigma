const fs = require('fs');
const path = require('path');

const libsRoot = path.join(__dirname, 'libs');

function processLib(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let hasProjectJson = fs.existsSync(path.join(dir, 'project.json'));

    if (hasProjectJson) {
        const pkgPath = path.join(dir, 'package.json');
        let pkg = {};
        if (fs.existsSync(pkgPath)) {
            try {
               pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            } catch(e) { pkg = {}; }
        }

        const projectJson = JSON.parse(fs.readFileSync(path.join(dir, 'project.json'), 'utf8'));
        if (!pkg.name) pkg.name = '@virteex/' + projectJson.name;
        if (!pkg.version) pkg.version = '0.0.1';
        pkg.type = 'commonjs';

        // PRODUCTION-READY: Point to compiled dist artifacts
        pkg.main = './src/index.js';
        pkg.types = './src/index.d.ts';
        pkg.exports = {
            ".": {
                "types": "./src/index.d.ts",
                "import": "./src/index.js",
                "require": "./src/index.js",
                "default": "./src/index.js"
            },
            "./package.json": "./package.json"
        };

        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

        // Update project.json to use @nx/js:tsc
        if (!projectJson.targets) projectJson.targets = {};

        const relativeDir = path.relative(__dirname, dir);
        projectJson.targets.build = {
            "executor": "@nx/js:tsc",
            "outputs": ["{options.outputPath}"],
            "options": {
                "outputPath": `dist/${relativeDir}`,
                "main": `${relativeDir}/src/index.ts`,
                "tsConfig": `${relativeDir}/tsconfig.lib.json`,
                "assets": [`${relativeDir}/*.md`],
                "generateExportsField": true
            }
        };
        fs.writeFileSync(path.join(dir, 'project.json'), JSON.stringify(projectJson, null, 2));

    } else {
        for (const entry of entries) {
            if (entry.isDirectory() && entry.name !== 'node_modules') {
                processLib(path.join(dir, entry.name));
            }
        }
    }
}

processLib(libsRoot);
