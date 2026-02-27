#!/bin/bash
# Write complete nginx config for daterabbit, preserving SSL certs configured by certbot
# This script is designed to be idempotent and run on every deployment

set -e

CONF="/etc/nginx/sites-available/daterabbit"
ENABLED="/etc/nginx/sites-enabled/daterabbit"
SSL_CERT="/etc/letsencrypt/live/daterabbit.smartlaunchhub.com/fullchain.pem"
SSL_KEY="/etc/letsencrypt/live/daterabbit.smartlaunchhub.com/privkey.pem"
SSL_OPTS="/etc/letsencrypt/options-ssl-nginx.conf"
SSL_DH="/etc/letsencrypt/ssl-dhparams.pem"

echo "=== Writing complete nginx config for daterabbit ==="
echo "SSL cert exists: $(ls $SSL_CERT 2>/dev/null && echo YES || echo NO)"

# Check if SSL certs exist
if [ -f "$SSL_CERT" ] && [ -f "$SSL_KEY" ]; then
  echo "Writing HTTPS config with SSL..."
  cat > "$CONF" << 'NGINXEOF'
server {
    server_name daterabbit.smartlaunchhub.com;

    root /var/www/daterabbit;
    index index.html;

    # API proxy to NestJS backend
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

    # Uploads served from backend
    location /uploads/ {
        alias /var/www/daterabbit/api/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Static files (Expo web build)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache Expo static assets
    location /_expo {
        alias /var/www/daterabbit/_expo;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/daterabbit.smartlaunchhub.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/daterabbit.smartlaunchhub.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = daterabbit.smartlaunchhub.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name daterabbit.smartlaunchhub.com;
    return 404; # managed by Certbot
}
NGINXEOF
else
  echo "WARNING: SSL certs not found, writing HTTP-only config..."
  cat > "$CONF" << 'NGINXEOF'
server {
    listen 80;
    server_name daterabbit.smartlaunchhub.com;

    root /var/www/daterabbit;
    index index.html;

    # API proxy to NestJS backend
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

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINXEOF
fi

echo "Config written to $CONF"

# Ensure symlink exists in sites-enabled
if [ ! -L "$ENABLED" ] || [ ! -e "$ENABLED" ]; then
  echo "Creating symlink in sites-enabled..."
  ln -sf "$CONF" "$ENABLED"
fi

# Set proper permissions
chmod 644 "$CONF"
echo "Done writing nginx config"
echo "Proxy block count: $(grep -c 'proxy_pass http://127.0.0.1:3004' "$CONF")"
