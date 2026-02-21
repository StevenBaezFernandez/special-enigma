import os
import glob

def fix_project_json():
    # Find all project.json files in apps/backend
    files = glob.glob('apps/backend/*/project.json')

    for filepath in files:
        print(f"Processing {filepath}...")
        with open(filepath, 'r') as f:
            content = f.read()

        # Replace 'apps/virteex-' with 'apps/backend/virteex-'
        # But avoid double replacement if 'apps/backend/virteex-' already exists
        # A simple way is to replace 'apps/virteex-' and then fix any 'apps/backend/backend/virteex-' if that happens?
        # No, better to be precise.

        # We can just replace "apps/virteex-" with "apps/backend/virteex-"
        # and then verify.

        new_content = content.replace('"apps/virteex-', '"apps/backend/virteex-')
        new_content = new_content.replace('"cwd": "apps/virteex-', '"cwd": "apps/backend/virteex-')

        if content != new_content:
            print(f"  Fixing {filepath}")
            with open(filepath, 'w') as f:
                f.write(new_content)
        else:
            print(f"  No changes needed for {filepath}")

if __name__ == "__main__":
    fix_project_json()
