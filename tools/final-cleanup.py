import json
import os
import re

def fix_tsconfig():
    with open('tsconfig.base.json', 'r') as f:
        config = json.load(f)
    paths = config.get('compilerOptions', {}).get('paths', {})
    new_paths = {}
    for alias, locs in paths.items():
        valid_locs = []
        for loc in locs:
            fixed_loc = loc.replace('libs/domain/domain-finops-domain/domain/', 'libs/domain/finops/domain/')
            fixed_loc = fixed_loc.replace('libs/domains/', 'libs/domain/')
            check_path = fixed_loc.replace('/*', '')
            if os.path.exists(check_path):
                valid_locs.append(fixed_loc)
        if valid_locs:
            new_paths[alias] = valid_locs

    if '@virteex/domain-finops-application' not in new_paths:
        new_paths['@virteex/domain-finops-application'] = ["libs/domain/finops/application/src/index.ts"]
        new_paths['@virteex/domain-finops-application/*'] = ["libs/domain/finops/application/src/*"]

    config['compilerOptions']['paths'] = new_paths
    with open('tsconfig.base.json', 'w') as f:
        json.dump(config, f, indent=2)
        f.write('\n')

def fix_project_tags():
    for root, dirs, files in os.walk('.'):
        if 'project.json' in files:
            path = os.path.join(root, 'project.json')
            with open(path, 'r') as f:
                project = json.load(f)
            tags = project.get('tags', [])
            modified = False
            if not any(t.startswith('platform:') for t in tags):
                tags.append('platform:server')
                modified = True
            if not any(t.startswith('criticality:') for t in tags):
                tags.append('criticality:medium')
                modified = True
            if 'criticality:high' in tags:
                if not any(t.startswith('compliance:') for t in tags):
                    tags.append('compliance:none')
                    modified = True
                if not any(t.startswith('tenant-mode:') for t in tags):
                    tags.append('tenant-mode:multi')
                    modified = True
                if not any(t.startswith('region:') for t in tags):
                    tags.append('region:global')
                    modified = True
            if 'libs/platform' in path and 'scope:platform' not in tags:
                tags = [t for t in tags if not t.startswith('scope:')] + ['scope:platform']
                modified = True
            if 'type:contract' in tags:
                tags = ['type:contracts' if t == 'type:contract' else t for t in tags]
                modified = True

            targets = project.get('targets', {})
            for target_name, target_config in targets.items():
                options = target_config.get('options', {})
                if 'rootDir' in options and 'libs/domains/' in options['rootDir']:
                    options['rootDir'] = options['rootDir'].replace('libs/domains/', 'libs/domain/')
                    modified = True

            if modified:
                project['tags'] = tags
                with open(path, 'w') as f:
                    json.dump(project, f, indent=2)
                    f.write('\n')

def fix_validate_script():
    with open('tools/validate-project-tags.mjs', 'r') as f:
        content = f.read()
    content = content.replace("POLICY_MODE || 'warn'", "POLICY_MODE || 'error'")
    if "criticality:high" not in content:
         extra_check = """
    if (tags.some((t) => t === 'criticality:high')) {
      const extraFamilies = ['compliance:', 'tenant-mode:', 'region:'];
      const missingExtra = extraFamilies.filter(
        (family) => !tags.some((t) => t.startsWith(family))
      );
      if (missingExtra.length > 0) {
        const msg = `✖ ${project.name} (${projectPath}) is missing high criticality tags (${missingExtra.join(', ')})`;
        if (POLICY_MODE === 'error') {
          console.error(msg);
          hasViolations = true;
        } else {
          console.warn(`⚠ (Warn) ${msg}`);
        }
      }
    }
"""
         content = content.replace("validateDir(join(dir, entry.name));", extra_check + "      validateDir(join(dir, entry.name));")
    with open('tools/validate-project-tags.mjs', 'w') as f:
        f.write(content)

def fix_eslint():
    with open('eslint.config.mjs', 'r') as f:
        content = f.read()

    # Simple replaces for common issues
    content = content.replace("'type:contract'", "'type:contracts'")

    if "scope:finops" not in content:
        content = content.replace("sourceTag: 'scope:accounting'", "sourceTag: 'scope:finops',\n              onlyDependOnLibsWithTags: ['scope:finops', 'scope:shared', 'scope:kernel']\n            },\n            {\n              sourceTag: 'scope:accounting'")

    if "scope:platform" not in content:
        content = content.replace("sourceTag: 'scope:accounting'", "sourceTag: 'scope:platform',\n              onlyDependOnLibsWithTags: ['scope:platform', 'scope:shared', 'scope:kernel']\n            },\n            {\n              sourceTag: 'scope:accounting'")

    # Allow kernel and platform in major layers
    layers = ['type:domain', 'type:application', 'type:infrastructure', 'type:app', 'type:presentation']
    for layer in layers:
        pattern = rf"sourceTag: '{layer}',\s+onlyDependOnLibsWithTags: \[\s+([^\]]+)\]"
        def replacer(match):
            tags_str = match.group(1)
            new_tags = tags_str
            if "'type:kernel'" not in tags_str:
                 new_tags = new_tags.replace("]", "                'type:kernel',\n              ]")
            if "'scope:kernel'" not in tags_str:
                 new_tags = new_tags.replace("]", "                'scope:kernel',\n              ]")
            if layer in ['type:infrastructure', 'type:app', 'type:presentation'] and "'scope:platform'" not in tags_str:
                 new_tags = new_tags.replace("]", "                'scope:platform',\n              ]")
            if "'type:contracts'" not in tags_str:
                 new_tags = new_tags.replace("]", "                'type:contracts',\n              ]")
            return match.group(0).replace(tags_str, new_tags)
        content = re.sub(pattern, replacer, content, flags=re.MULTILINE)

    with open('eslint.config.mjs', 'w') as f:
        f.write(content)

if __name__ == "__main__":
    fix_tsconfig()
    fix_project_tags()
    fix_validate_script()
    fix_eslint()
