import json
import os

def main():
    with open('tsconfig.base.json', 'r') as f:
        content = f.read()
        # Handle possible trailing commas or other JSON oddities if any, but standard json should work
        config = json.loads(content)

    paths = config.get('compilerOptions', {}).get('paths', {})
    new_paths = {}

    for alias, locs in paths.items():
        valid_locs = []
        for loc in locs:
            # Fix finops-domain specifically as it was identified as wrong
            fixed_loc = loc.replace('libs/domain/domain-finops-domain/domain/', 'libs/domain/finops/domain/')
            # Fix libs/domains -> libs/domain
            fixed_loc = fixed_loc.replace('libs/domains/', 'libs/domain/')

            # Check if it exists
            check_path = fixed_loc.replace('/*', '')
            if os.path.exists(check_path):
                valid_locs.append(fixed_loc)
            else:
                print(f"Removing invalid path mapping: {alias} -> {loc} (fixed: {fixed_loc})")

        if valid_locs:
            new_paths[alias] = valid_locs

    config['compilerOptions']['paths'] = new_paths

    with open('tsconfig.base.json', 'w') as f:
        json.dump(config, f, indent=2)
        f.write('\n')

if __name__ == "__main__":
    main()
