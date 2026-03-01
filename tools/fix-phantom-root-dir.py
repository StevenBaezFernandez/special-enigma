import json
import os

def main():
    for root, dirs, files in os.walk('libs'):
        if 'project.json' in files:
            path = os.path.join(root, 'project.json')
            with open(path, 'r') as f:
                project = json.load(f)

            modified = False
            targets = project.get('targets', {})
            for target_name, target_config in targets.items():
                options = target_config.get('options', {})
                if 'rootDir' in options:
                    if 'libs/domains/' in options['rootDir']:
                        options['rootDir'] = options['rootDir'].replace('libs/domains/', 'libs/domain/')
                        modified = True

            if modified:
                with open(path, 'w') as f:
                    json.dump(project, f, indent=2)
                    f.write('\n')

if __name__ == "__main__":
    main()
