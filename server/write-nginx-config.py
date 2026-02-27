#!/usr/bin/env python3
"""Write complete nginx config for daterabbit.
Usage: python3 write-nginx-config.py <conf_path>
Preserves SSL cert paths configured by certbot.
Idempotent - safe to run on every deployment.
"""
import sys
import os

conf_path = sys.argv[1] if len(sys.argv) > 1 else "/etc/nginx/sites-available/daterabbit"

ssl_cert = "/etc/letsencrypt/live/daterabbit.smartlaunchhub.com/fullchain.pem"
ssl_key = "/etc/letsencrypt/live/daterabbit.smartlaunchhub.com/privkey.pem"
ssl_opts = "/etc/letsencrypt/options-ssl-nginx.conf"
ssl_dh = "/etc/letsencrypt/ssl-dhparams.pem"

has_ssl = os.path.isfile(ssl_cert) and os.path.isfile(ssl_key)
print(f"SSL cert exists: {has_ssl}")

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

if has_ssl:
    config = f"""server {{
    server_name daterabbit.smartlaunchhub.com;

    root /var/www/daterabbit;
    index index.html;

{proxy_block}
    location /uploads/ {{
        alias /var/www/daterabbit/api/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }}

    location / {{
        try_files $uri $uri/ /index.html;
    }}

    location /_expo {{
        alias /var/www/daterabbit/_expo;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }}

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    listen 443 ssl; # managed by Certbot
    ssl_certificate {ssl_cert}; # managed by Certbot
    ssl_certificate_key {ssl_key}; # managed by Certbot
    include {ssl_opts}; # managed by Certbot
    ssl_dhparam {ssl_dh}; # managed by Certbot
}}

server {{
    if ($host = daterabbit.smartlaunchhub.com) {{
        return 301 https://$host$request_uri;
    }} # managed by Certbot

    listen 80;
    server_name daterabbit.smartlaunchhub.com;
    return 404; # managed by Certbot
}}
"""
else:
    print("WARNING: SSL certs not found, writing HTTP-only config")
    config = f"""server {{
    listen 80;
    server_name daterabbit.smartlaunchhub.com;

    root /var/www/daterabbit;
    index index.html;

{proxy_block}
    location / {{
        try_files $uri $uri/ /index.html;
    }}
}}
"""

with open(conf_path, "w") as f:
    f.write(config)

count = config.count("proxy_pass http://127.0.0.1:3004")
print(f"Config written to {conf_path} (proxy_pass count: {count})")
