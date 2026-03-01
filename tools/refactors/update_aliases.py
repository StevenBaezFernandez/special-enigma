import json
import os
import re

def update_tsconfig():
    filepath = 'tsconfig.base.json'
    with open(filepath, 'r') as f:
        data = json.load(f)

    paths = data.get('compilerOptions', {}).get('paths', {})
    new_paths = {}

    for key, value in paths.items():
        new_key = key.replace('@virteex-erp/', '@virteex/')
        new_paths[new_key] = value

    data['compilerOptions']['paths'] = new_paths

    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Updated {filepath}")

def update_package_json():
    filepath = 'package.json'
    with open(filepath, 'r') as f:
        content = f.read()

    new_content = content.replace('@virteex-erp/', '@virteex/')

    if content != new_content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

def update_files_in_dir(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in root or '.git' in root:
            continue

        for file in files:
            if file.endswith(('.ts', '.html', '.scss', '.json', '.js')):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r') as f:
                        content = f.read()

                    new_content = content.replace('@virteex-erp/', '@virteex/')

                    if content != new_content:
                        with open(filepath, 'w') as f:
                            f.write(new_content)
                        # print(f"Updated {filepath}") # Verbose
                except Exception as e:
                    print(f"Error processing {filepath}: {e}")

if __name__ == '__main__':
    print("Starting alias update...")
    update_tsconfig()
    update_package_json()
    print("Updating file contents in libs/ and apps/...")
    update_files_in_dir('libs')
    update_files_in_dir('apps')
    print("Done.")
