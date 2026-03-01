import os
import re
import sys

def resolve_path(base_file, relative_import):
    base_dir = os.path.dirname(base_file)
    target_path = os.path.normpath(os.path.join(base_dir, relative_import))
    return target_path

def get_alias_from_path(path):
    # path is like libs/domains/payroll/domain/src/index
    parts = path.split(os.sep)

    if "libs" not in parts:
        return None

    libs_index = parts.index("libs")
    # libs/domains/<domain>/<layer>

    if len(parts) > libs_index + 3 and parts[libs_index+1] == "domains":
        domain = parts[libs_index+2]
        layer = parts[libs_index+3]
        return f"@virteex/{domain}-{layer}"

    if len(parts) > libs_index + 2 and parts[libs_index+1] == "shared":
        shared_type = parts[libs_index+2]
        # handle shared-ui, shared-util-auth, etc.
        if shared_type == "ui":
            return "@virteex/shared-ui"
        if shared_type == "util":
            if len(parts) > libs_index + 3:
                util_name = parts[libs_index+3]
                return f"@virteex/shared-util-{util_name}"
        if shared_type == "contracts":
            return "@virteex/contracts"

    return None

def refactor_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content

    # 1. Replace generic aliases
    content = content.replace("'@virteex/domain'", "'@virteex/sample-domain'")
    content = content.replace("'@virteex/application'", "'@virteex/sample-application'")
    content = content.replace("'@virteex/infrastructure'", "'@virteex/sample-infrastructure'")
    content = content.replace("'@virteex/presentation'", "'@virteex/sample-presentation'")

    # 2. Fix relative imports
    def replace_relative(match):
        quote = match.group(1)
        import_path = match.group(2)

        if not import_path.startswith(".."):
            return match.group(0)

        # Resolve path
        target_abs_path = resolve_path(filepath, import_path)

        # Check if target is inside libs
        if "libs" not in target_abs_path:
             return match.group(0)

        # Generate alias
        alias = get_alias_from_path(target_abs_path)

        if alias:
            # Check if it was pointing to index or specific file
            # Ideally we only use alias for index imports between libs
            # But if deep import, we might need /src/lib/...
            # For now, assume cleanly structured imports to index
            if "index" in import_path or import_path.endswith("src"):
                 return f"from {quote}{alias}{quote}"
            else:
                 # If it imports specific file, technically not allowed via boundary?
                 # But if we map alias, we can use alias/lib/...
                 # Let's just use alias if it maps to the root of the lib
                 return f"from {quote}{alias}{quote}"

        return match.group(0)

    import_pattern = r"from\s+(['\"])(.*?)(['\"])"
    content = re.sub(import_pattern, replace_relative, content)

    # Also handle require or simple imports? Mostly standard imports in TS.

    if content != original_content:
        print(f"Refactoring paths in {filepath}...")
        with open(filepath, 'w') as f:
            f.write(content)

def main():
    root_dir = "libs"
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(".ts") and not file.endswith(".spec.ts"):
                refactor_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
