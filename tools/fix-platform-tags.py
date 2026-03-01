import json
import os

def fix_project(path):
    with open(path, 'r') as f:
        project = json.load(f)

    tags = project.get('tags', [])
    if 'libs/platform' in path:
        if 'scope:platform' not in tags:
            tags = [t for t in tags if not t.startswith('scope:')] + ['scope:platform']
            project['tags'] = tags
            with open(path, 'w') as f:
                json.dump(project, f, indent=2)
                f.write('\n')
            return True
    return False

def main():
    for root, dirs, files in os.walk('libs/platform'):
        if 'project.json' in files:
            fix_project(os.path.join(root, 'project.json'))

if __name__ == "__main__":
    main()
