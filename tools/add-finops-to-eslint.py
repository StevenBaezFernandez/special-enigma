import re

with open('eslint.config.mjs', 'r') as f:
    content = f.read()

finops_rule = """            {
              sourceTag: 'scope:finops',
              onlyDependOnLibsWithTags: ['scope:finops', 'scope:shared', 'scope:kernel']
            },"""

if "scope:finops" not in content:
    content = re.sub(r"            {", finops_rule + "\n            {", content, count=1, flags=re.MULTILINE)

with open('eslint.config.mjs', 'w') as f:
    f.write(content)
