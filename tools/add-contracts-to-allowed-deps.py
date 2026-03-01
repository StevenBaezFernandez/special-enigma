import re

with open('eslint.config.mjs', 'r') as f:
    content = f.read()

# Add type:contracts to other layers onlyDependOnLibsWithTags if it's missing but type:contract was there
layers = ['type:domain', 'type:application', 'type:infrastructure', 'type:app', 'type:presentation', 'type:ui']
for layer in layers:
    pattern = rf"sourceTag: '{layer}',\s+onlyDependOnLibsWithTags: \[\s+([^\]]+)\]"
    def replacer(match):
        tags_str = match.group(1)
        if "'type:contracts'" not in tags_str:
             # Add it if missing
             return match.group(0).replace("]", "                'type:contracts',\n              ]")
        return match.group(0)

    content = re.sub(pattern, replacer, content, flags=re.MULTILINE)

with open('eslint.config.mjs', 'w') as f:
    f.write(content)
