#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=shell/bootstrap.sh
source "${ROOT}/shell/bootstrap.sh"

CLUSTER_NAME="${CLUSTER_NAME:-helm-demo}"
RELEASE_NAME="${RELEASE_NAME:-hello}"

if helm status "${RELEASE_NAME}" >/dev/null 2>&1; then
  echo "Uninstalling Helm release '${RELEASE_NAME}'..."
  helm uninstall "${RELEASE_NAME}" || true
fi

if k3d cluster list 2>/dev/null | grep -q "${CLUSTER_NAME}"; then
  echo "Deleting k3d cluster '${CLUSTER_NAME}'..."
  k3d cluster delete "${CLUSTER_NAME}"
else
  echo "Cluster '${CLUSTER_NAME}' is not running."
fi

echo "Done."
