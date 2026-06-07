#!/usr/bin/env bash
set -euo pipefail

# Run from repo root or script dir
# cd "$(dirname "$0")/.."

echo "Stopping app container..."
docker compose stop app