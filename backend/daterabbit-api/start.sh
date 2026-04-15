#!/usr/bin/env bash
set -euo pipefail

export DOPPLER_TOKEN=$(cat /etc/doppler/daterabbit-stg.token)
exec doppler run -- node dist/main.js
