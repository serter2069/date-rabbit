#!/usr/bin/env python3
"""Patch nginx config to add /api/ proxy block for DateRabbit backend."""
import sys
import shutil

if len(sys.argv) < 2:
    print("Usage: python3 patch-nginx.py <nginx-config-path>")
    sys.exit(1)

conf_path = sys.argv[1]

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

with open(conf_path, 'r') as f:
    content = f.read()

# Backup to /tmp (runner may not have write access to /etc/nginx/)
import os
backup_path = '/tmp/nginx-daterabbit-' + os.path.basename(conf_path) + '.bak'
shutil.copy2(conf_path, backup_path)
print(f"Backup saved to {backup_path}")

# Insert before first 'location / {' (the catch-all)
marker = '    location / {'
if marker not in content:
    # Try without leading spaces
    marker = 'location / {'

if marker in content:
    content = content.replace(marker, proxy_block + marker, 1)
    with open(conf_path, 'w') as f:
        f.write(content)
    print(f"Proxy block inserted before '{marker}'")
else:
    print("WARN: Could not find 'location / {' block")
    sys.exit(0)
