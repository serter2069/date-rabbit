#!/usr/bin/env python3
"""Remove duplicate /api/ proxy location blocks from nginx config, keep exactly one."""
import sys
import re
import shutil
import os

if len(sys.argv) < 2:
    print("Usage: python3 fix-nginx-dedup.py <nginx-config-path>")
    sys.exit(1)

conf_path = sys.argv[1]

with open(conf_path, 'r') as f:
    content = f.read()

backup_path = '/tmp/nginx-dedup-' + os.path.basename(conf_path) + '.bak'
shutil.copy2(conf_path, backup_path)
print(f"Backup saved to {backup_path}")

# Count existing proxy blocks
count = content.count('proxy_pass http://127.0.0.1:3004')
print(f"Found {count} proxy_pass occurrences")

# Remove ALL existing /api/ location blocks (including the comment before them)
# Pattern matches the whole block including trailing newline
pattern = r'    # API proxy to NestJS backend\n    location /api/ \{[^}]*\}\n\n'
cleaned = re.sub(pattern, '', content)

# Verify removal
remaining = cleaned.count('proxy_pass http://127.0.0.1:3004')
print(f"After removal: {remaining} proxy_pass occurrences")

# Now add exactly one proxy block before 'location / {'
proxy_block = """    # API proxy to NestJS backend
    location /api/ {
        proxy_pass http://127.0.0.1:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 10m;
    }

"""

marker = '    location / {'
if marker not in cleaned:
    marker = 'location / {'

if marker in cleaned:
    # Insert proxy block before the catch-all location (first occurrence)
    cleaned = cleaned.replace(marker, proxy_block + marker, 1)
    print(f"Inserted single proxy block before '{marker}'")
else:
    print("ERROR: Could not find 'location / {' marker")
    sys.exit(1)

final_count = cleaned.count('proxy_pass http://127.0.0.1:3004')
print(f"Final proxy_pass count: {final_count}")

with open(conf_path, 'w') as f:
    f.write(cleaned)

print("Deduplication complete.")
