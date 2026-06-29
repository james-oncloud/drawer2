#!/usr/bin/env bash
set -euo pipefail

# Run from repo root or script dir
cd "$(dirname "$0")/.."

echo "Starting Jenkins..."
docker compose up -d

echo ""
echo "Jenkins UI: http://localhost:8081"
echo ""
echo "First-time setup — initial admin password:"
if docker compose exec -T jenkins test -f /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null; then
  docker compose exec -T jenkins cat /var/jenkins_home/secrets/initialAdminPassword
else
  echo "  (not ready yet — run again in a minute, or use:)"
  echo "  docker compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword"
fi
