import json
import os

REQUIRED_FAMILIES = ['scope:', 'type:', 'platform:', 'criticality:']

def fix_project(path):
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

    if modified:
        project['tags'] = tags
        with open(path, 'w') as f:
            json.dump(project, f, indent=2)
            f.write('\n')
        return True
    return False

def main():
    for root, dirs, files in os.walk('libs'):
        if 'project.json' in files:
            fix_project(os.path.join(root, 'project.json'))
    for root, dirs, files in os.walk('apps'):
        if 'project.json' in files:
            fix_project(os.path.join(root, 'project.json'))

if __name__ == "__main__":
    main()
