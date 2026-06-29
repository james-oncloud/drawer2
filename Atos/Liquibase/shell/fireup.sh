#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Building and starting Postgres + app..."
docker compose up --build -d

echo ""
echo "Postgres: localhost:5433 (user demo / password demo / db liquibase_demo)"
echo "App:      http://localhost:8082/users"
echo "Health:   http://localhost:8082/health"
echo ""
echo "Logs: docker compose logs -f app"
