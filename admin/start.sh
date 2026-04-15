#!/usr/bin/env bash
set -euo pipefail

cd /var/www/daterabbit/admin
exec npx next start -p 3005
