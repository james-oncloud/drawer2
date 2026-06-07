#!/usr/bin/env bash
set -euo pipefail

# Run from repo root or script dir
# cd "$(dirname "$0")/."

echo "Stopping containers..."
./shutdown-app.sh
./shutdown-prometheus.sh
./shutdown-grafana.sh