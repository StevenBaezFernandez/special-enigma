import re

with open('eslint.config.mjs', 'r') as f:
    content = f.read()

# Add type:kernel and scope:kernel to layers that likely need it
layers = ['type:domain', 'type:application', 'type:infrastructure', 'type:app', 'type:presentation']
for layer in layers:
    pattern = rf"sourceTag: '{layer}',\s+onlyDependOnLibsWithTags: \[\s+([^\]]+)\]"
    def replacer(match):
        tags_str = match.group(1)
        new_tags = tags_str
        if "'type:kernel'" not in tags_str:
             new_tags = new_tags.replace("]", "                'type:kernel',\n              ]")
        if "'scope:kernel'" not in tags_str:
             new_tags = new_tags.replace("]", "                'scope:kernel',\n              ]")
        return match.group(0).replace(tags_str, new_tags)

    content = re.sub(pattern, replacer, content, flags=re.MULTILINE)

with open('eslint.config.mjs', 'w') as f:
    f.write(content)
