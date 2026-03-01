import json
import os

def fix_project(path):
    with open(path, 'r') as f:
        project = json.load(f)

    tags = project.get('tags', [])
    if 'type:contract' in tags:
        tags = ['type:contracts' if t == 'type:contract' else t for t in tags]
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

if __name__ == "__main__":
    main()
