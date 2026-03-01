import re

with open('eslint.config.mjs', 'r') as f:
    content = f.read()

if "'type:contract'" in content and "'type:contracts'" not in content:
    content = content.replace("'type:contract'", "'type:contracts'")

with open('eslint.config.mjs', 'w') as f:
    f.write(content)
