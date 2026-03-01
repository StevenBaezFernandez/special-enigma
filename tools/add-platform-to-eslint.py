import re

with open('eslint.config.mjs', 'r') as f:
    content = f.read()

platform_rule = """            {
              sourceTag: 'type:presentation',
              onlyDependOnLibsWithTags: [
                'type:application',
                'type:domain',
                'type:infrastructure',
                'type:contracts',
                'type:util',
                'scope:platform',
              ],
            },"""

# This is a bit complex for a simple replace, let's just make sure it's there or similar
# Actually I'll just add a general rule for scope:platform
if "scope:platform" not in content:
     content = content.replace("            {", "            {\n              sourceTag: 'scope:platform',\n              onlyDependOnLibsWithTags: ['scope:platform', 'scope:shared', 'scope:kernel']\n            },\n            {", 1)

with open('eslint.config.mjs', 'w') as f:
    f.write(content)
