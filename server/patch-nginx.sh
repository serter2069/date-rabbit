#!/bin/bash
# Patch existing nginx config to add API proxy for DateRabbit backend
# Usage: sudo bash server/patch-nginx.sh

set -e

echo "=== Finding nginx config for daterabbit ==="
CONF=$(grep -rl "daterabbit" /etc/nginx/sites-enabled/ 2>/dev/null | head -1)
if [ -z "$CONF" ]; then
  CONF=$(grep -rl "daterabbit" /etc/nginx/sites-available/ 2>/dev/null | head -1)
fi

if [ -z "$CONF" ]; then
  echo "WARN: No nginx config found for daterabbit domain"
  exit 0
fi

echo "Found config: $CONF"

if grep -q "proxy_pass.*3004" "$CONF" 2>/dev/null; then
  echo "API proxy already configured, skipping"
  exit 0
fi

echo "Injecting /api/ proxy block..."

# Create the proxy block
PROXY_BLOCK='    # API proxy to NestJS backend
    location /api/ {
        proxy_pass http://127.0.0.1:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection '\''upgrade'\'';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 10m;
    }
'

# Backup original
cp "$CONF" "${CONF}.bak"

# Use python for reliable text insertion (available on Ubuntu)
python3 -c "
import sys
conf_path = sys.argv[1]
proxy_block = '''    # API proxy to NestJS backend
    location /api/ {
        proxy_pass http://127.0.0.1:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_cache_bypass \\\$http_upgrade;
        client_max_body_size 10m;
    }

'''

with open(conf_path, 'r') as f:
    content = f.read()

# Insert before 'location / {' (catch-all)
if 'location / {' in content:
    content = content.replace('    location / {', proxy_block + '    location / {', 1)
else:
    print('WARN: Could not find location / block to insert before')
    sys.exit(0)

with open(conf_path, 'w') as f:
    f.write(content)

print('Proxy block inserted successfully')
" "$CONF"

nginx -t && systemctl reload nginx && echo "Nginx patched and reloaded successfully"
