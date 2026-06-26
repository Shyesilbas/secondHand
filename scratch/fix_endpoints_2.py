import re

file_path = 'secondhand-frontend/src/common/constants/apiEndpoints.js'
with open(file_path, 'r') as f:
    content = f.read()

replacements = {
    "'/v1/auth/password/forgot'": "'/v1/auth/passwords/forgot'",
    "'/v1/auth/password/reset'": "'/v1/auth/passwords/reset'",
    "'/v1/auth/password/change'": "'/v1/auth/passwords/change'",
    "'/v1/showcases/bulk'": "'/v1/showcases/bulks'",
    "'/v1/campaigns'": "'/v1/campaigns/active'",
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, 'w') as f:
    f.write(content)
