#!/usr/bin/env bash
set -euo pipefail

# Run from repo root or script dir
cd "$(dirname "$0")/.."

echo "Stopping app container..."
docker compose stop app

echo "Rebuilding app image (no cache)..."
docker compose build --no-cache app

echo "Recreating and starting app..."
docker compose up -d --force-recreate app

echo "Done. Recent logs:"
docker compose logs --tail=20 app