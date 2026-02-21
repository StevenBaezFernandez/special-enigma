import os
import glob

def fix_tsconfigs():
    # Find all tsconfig*.json files in apps/backend
    files = glob.glob('apps/backend/*/tsconfig*.json')

    for filepath in files:
        print(f"Processing {filepath}...")
        with open(filepath, 'r') as f:
            content = f.read()

        # Replace "../../tsconfig.base.json" with "../../../tsconfig.base.json"
        # But verify we don't double replace
        if '"../../tsconfig.base.json"' in content:
            new_content = content.replace('"../../tsconfig.base.json"', '"../../../tsconfig.base.json"')

            print(f"  Fixing {filepath}")
            with open(filepath, 'w') as f:
                f.write(new_content)
        else:
             print(f"  No change needed for {filepath} (or pattern not found)")

if __name__ == "__main__":
    fix_tsconfigs()
