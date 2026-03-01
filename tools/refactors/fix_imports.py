import json
import os
import re

def load_tsconfig_paths(tsconfig_path):
    with open(tsconfig_path, 'r') as f:
        content = f.read()
        content = re.sub(r'//.*', '', content)
        content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
        try:
            data = json.loads(content)
        except json.JSONDecodeError as e:
            print(f"Error decoding tsconfig: {e}")
            return {}

    paths = data.get('compilerOptions', {}).get('paths', {})
    mapping = {}
    for alias, locations in paths.items():
        if not locations:
            continue
        loc = locations[0]
        alias_root = alias.replace('/*', '')
        loc_root = loc.replace('/*', '')

        if loc_root.endswith('/index.ts'):
             loc_root = loc_root[:-9]
        if loc_root.endswith('/src'):
             loc_root = loc_root[:-4]

        loc_root = os.path.normpath(loc_root)
        mapping[loc_root] = alias_root

    return mapping

def fix_imports(root_dir, mapping):
    sorted_paths = sorted(mapping.keys(), key=len, reverse=True)
    extensions = ('.ts', '.tsx', '.js', '.jsx')
    pattern = re.compile(r'(from\s+|require\(\s*)(["\'])([\.\/][^"\']*)(["\'])')

    for dirpath, _, filenames in os.walk(root_dir):
        if 'node_modules' in dirpath or 'dist' in dirpath:
            continue

        for filename in filenames:
            if not filename.endswith(extensions):
                continue

            filepath = os.path.join(dirpath, filename)

            with open(filepath, 'r') as f:
                content = f.read()

            current_file_abs_path = os.path.abspath(filepath)
            current_file_dir = os.path.dirname(current_file_abs_path)
            repo_root = os.path.abspath(os.getcwd())

            def replace_import(match):
                prefix = match.group(1)
                quote = match.group(2)
                imp_path = match.group(3)
                closing_quote = match.group(4)

                if not imp_path.startswith('.'):
                    return match.group(0)

                imported_file_path = os.path.normpath(os.path.join(current_file_dir, imp_path))

                try:
                    rel_path_from_root = os.path.relpath(imported_file_path, repo_root)
                except ValueError:
                    return match.group(0)

                if rel_path_from_root.startswith('..'):
                    return match.group(0)

                rel_path_from_root = rel_path_from_root.replace('\\', '/')

                for lib_path in sorted_paths:
                    if rel_path_from_root == lib_path or rel_path_from_root.startswith(lib_path + '/'):
                        # Skip if we are inside the same library!
                        # lib_path is "libs/domain/x/src" (normalized)
                        # current_file is "libs/domain/x/src/lib/file.ts"
                        # We should verify if current file is INSIDE lib_path.

                        # Get relative path of current file from root
                        curr_rel = os.path.relpath(current_file_abs_path, repo_root).replace('\\', '/')
                        if curr_rel.startswith(lib_path + '/'):
                            # Importing internal file via alias? Skip.
                            return match.group(0)

                        alias = mapping[lib_path]
                        suffix = rel_path_from_root[len(lib_path):]

                        if suffix.startswith('/'):
                            suffix = suffix[1:]

                        if suffix == 'index.ts' or suffix == 'index' or suffix == '':
                            new_path = alias
                        else:
                            if suffix.endswith('.ts'): suffix = suffix[:-3]
                            elif suffix.endswith('.tsx'): suffix = suffix[:-4]
                            elif suffix.endswith('.js'): suffix = suffix[:-3]
                            new_path = f"{alias}/{suffix}"

                        return f"{prefix}{quote}{new_path}{closing_quote}"

                return match.group(0)

            fixed_content = pattern.sub(replace_import, content)

            if fixed_content != content:
                print(f"Fixing imports in {filepath}")
                with open(filepath, 'w') as f_out:
                    f_out.write(fixed_content)

if __name__ == '__main__':
    mapping = load_tsconfig_paths('tsconfig.base.json')
    fix_imports('libs', mapping)
    fix_imports('apps', mapping)
