import re

with open('eslint.config.mjs', 'r') as f:
    content = f.read()

layers = ['type:infrastructure', 'type:app', 'type:presentation']
for layer in layers:
    pattern = rf"sourceTag: '{layer}',\s+onlyDependOnLibsWithTags: \[\s+([^\]]+)\]"
    def replacer(match):
        tags_str = match.group(1)
        if "'scope:platform'" not in tags_str:
             return match.group(0).replace("]", "                'scope:platform',\n              ]")
        return match.group(0)

    content = re.sub(pattern, replacer, content, flags=re.MULTILINE)

with open('eslint.config.mjs', 'w') as f:
    f.write(content)
