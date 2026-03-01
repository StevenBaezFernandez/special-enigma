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

        # Normalize loc_root
        if loc_root.endswith('/index.ts'):
             loc_root = loc_root[:-9]
        if loc_root.endswith('/src'):
             loc_root = loc_root[:-4] # keep src for matching? No, usually libs/x/src is the root.

        # Actually, let's keep the full path to source root
        loc_root = loc.replace('/*', '')
        if loc_root.endswith('/index.ts'):
            loc_root = loc_root[:-9]

        loc_root = os.path.normpath(loc_root)
        mapping[loc_root] = alias_root

    return mapping

def fix_self_references(root_dir, mapping):
    # Sort mapping keys by length (descending) to match longest path first
    sorted_paths = sorted(mapping.keys(), key=len, reverse=True)

    extensions = ('.ts', '.tsx', '.js', '.jsx')
    # Regex to capture imports: import ... from "..." or require("...")
    pattern = re.compile(r'(from\s+|require\(\s*)(["\'])([^"\']+)(["\'])')

    for dirpath, _, filenames in os.walk(root_dir):
        if 'node_modules' in dirpath or 'dist' in dirpath:
            continue

        for filename in filenames:
            if not filename.endswith(extensions):
                continue

            filepath = os.path.join(dirpath, filename)

            # Determine which library this file belongs to
            current_file_abs = os.path.abspath(filepath)
            repo_root = os.path.abspath(os.getcwd())
            rel_path_from_root = os.path.relpath(current_file_abs, repo_root)

            # Find the library path that contains this file
            current_lib_path = None
            current_alias = None

            # Check against sorted paths
            # path in mapping is like 'libs/domains/identity/src'
            # rel_path_from_root is like 'libs/domains/identity/src/lib/file.ts'

            path_parts = rel_path_from_root.split(os.sep)
            # We need to match the beginning of the path

            for lib_path in sorted_paths:
                # lib_path is normalized, e.g. libs/domains/identity/src
                if rel_path_from_root.startswith(lib_path):
                     current_lib_path = lib_path
                     current_alias = mapping[lib_path]
                     break

            if not current_alias:
                continue

            with open(filepath, 'r') as f:
                content = f.read()

            def replace_import(match):
                prefix = match.group(1)
                quote = match.group(2)
                imp_path = match.group(3)
                closing_quote = match.group(4)

                # Check if the import starts with the current alias
                if imp_path == current_alias or imp_path.startswith(current_alias + '/'):
                    # It is a self-reference!

                    # Resolve the target file path
                    # alias -> lib_path
                    # alias/subdir -> lib_path/subdir

                    suffix = imp_path[len(current_alias):]
                    if suffix.startswith('/'):
                        suffix = suffix[1:]

                    target_path_from_root = os.path.join(current_lib_path, suffix)

                    # Now calculate relative path from current file to target
                    # current file: libs/domains/identity/src/lib/file.ts
                    # target file: libs/domains/identity/src/lib/other.ts

                    # os.path.relpath(target, start)
                    # start is directory of current file
                    start_dir = os.path.dirname(rel_path_from_root)

                    rel_target = os.path.relpath(target_path_from_root, start_dir)

                    if not rel_target.startswith('.'):
                        rel_target = './' + rel_target

                    # Fix windows separators
                    rel_target = rel_target.replace('\\', '/')

                    print(f"Fixing self-reference in {filepath}: {imp_path} -> {rel_target}")
                    return f"{prefix}{quote}{rel_target}{closing_quote}"

                return match.group(0)

            fixed_content = pattern.sub(replace_import, content)

            if fixed_content != content:
                with open(filepath, 'w') as f_out:
                    f_out.write(fixed_content)

if __name__ == '__main__':
    mapping = load_tsconfig_paths('tsconfig.base.json')
    # print("Mappings:", mapping)
    fix_self_references('libs', mapping)
    fix_self_references('apps', mapping)
