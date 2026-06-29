#!/usr/bin/env bash
set -euo pipefail

# Run from repo root or script dir
# cd "$(dirname "$0")/.."

echo "Stopping grafana container..."
docker compose stop grafana