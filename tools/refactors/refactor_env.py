import os
import re

def refactor_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    if 'environment' not in content:
        return

    # Check for environment import
    env_import_pattern = r"import\s+\{\s*environment\s*\}\s+from\s+['\"].*?environment['\"];?"
    if not re.search(env_import_pattern, content):
        return

    # Check if class uses inject() property assignment
    uses_inject = "inject(" in content or "inject<" in content

    # If it's a spec file, we might just need to remove the import if unused, or mock it.
    # But usually spec files import environment to mock it or check values.
    # For now, let's focus on .ts files, not spec.
    if filepath.endswith(".spec.ts"):
        print(f"Skipping spec file {filepath}")
        return

    if not uses_inject:
        print(f"Skipping {filepath} (Might use constructor injection or no injection)")
        return

    print(f"Refactoring {filepath}...")

    # 1. Update Imports
    content = re.sub(env_import_pattern, "", content)

    if "import { APP_CONFIG }" not in content:
        content = "import { APP_CONFIG } from '@virteex/shared-config';\n" + content

    if "import { inject" not in content and "import {inject" not in content:
         core_pattern = r"import\s+\{([^}]*)\}\s+from\s+['\"]@angular/core['\"];"
         match = re.search(core_pattern, content)
         if match:
             imports = match.group(1)
             if "inject" not in imports:
                 new_imports = imports + ", inject"
                 content = content.replace(imports, new_imports)
         else:
             content = "import { inject } from '@angular/core';\n" + content

    # 2. Add config property
    class_pattern = r"(export\s+class\s+\w+\s*\{)"

    def add_config_prop(match):
        return match.group(1) + "\n  private config = inject(APP_CONFIG);"

    content = re.sub(class_pattern, add_config_prop, content, count=1)

    # 3. Replace usages
    content = content.replace("environment.apiUrl", "this.config.apiUrl")
    content = content.replace("environment.production", "this.config.production")
    content = content.replace("environment.recaptcha", "this.config.recaptcha")

    # Clean up blank lines
    content = re.sub(r'\n\s*\n', '\n\n', content)

    with open(filepath, 'w') as f:
        f.write(content)

def main():
    root_dir = "libs/domains"
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(".ts") and not file.endswith(".spec.ts"):
                refactor_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
