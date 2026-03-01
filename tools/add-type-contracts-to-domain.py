import re

with open('eslint.config.mjs', 'r') as f:
    content = f.read()

# Make sure type:domain can also depend on type:contracts (it was partially there)
pattern = r"sourceTag: 'type:domain',\s+onlyDependOnLibsWithTags: \[\s+([^\]]+)\]"
def replacer(match):
    tags_str = match.group(1)
    if "'type:contracts'" not in tags_str:
         return match.group(0).replace("]", "                'type:contracts',\n              ]")
    return match.group(0)

content = re.sub(pattern, replacer, content, flags=re.MULTILINE)

with open('eslint.config.mjs', 'w') as f:
    f.write(content)
