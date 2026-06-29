#!/usr/bin/env bash
set -euo pipefail

# Run from repo root or script dir
# cd "$(dirname "$0")/.."

echo "Stopping prometheus container..."
docker compose stop prometheus