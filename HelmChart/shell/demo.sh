#!/usr/bin/env bash
# Walk through core Helm workflows against the running demo cluster.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=shell/bootstrap.sh
source "${ROOT}/shell/bootstrap.sh"

CLUSTER_NAME="${CLUSTER_NAME:-helm-demo}"
RELEASE_NAME="${RELEASE_NAME:-hello}"
CHART_PATH="${ROOT}/chart/hello"
PACKAGES_DIR="${ROOT}/packages"
HOST_PORT="${HOST_PORT:-18080}"

export KUBECONFIG
KUBECONFIG="$(k3d kubeconfig write "${CLUSTER_NAME}")"

if ! k3d cluster list 2>/dev/null | grep -q "${CLUSTER_NAME}"; then
  echo "Cluster '${CLUSTER_NAME}' is not running. Run ./shell/fireup.sh first." >&2
  exit 1
fi

section() {
  echo ""
  echo "=== $* ==="
}

section "1. Render templates locally (no cluster changes)"
helm template "${RELEASE_NAME}" "${CHART_PATH}" | head -40
echo "... (truncated)"

section "2. Current release values"
helm get values "${RELEASE_NAME}"

section "3. Hit the app"
curl -s "http://localhost:${HOST_PORT}" || true
echo ""

section "4. Upgrade with values-upgrade.yaml (2 replicas, new message)"
helm upgrade "${RELEASE_NAME}" "${CHART_PATH}" -f "${CHART_PATH}/values-upgrade.yaml"
kubectl rollout status deployment/"${RELEASE_NAME}" --timeout=120s
curl -s "http://localhost:${HOST_PORT}" || true
echo ""

section "5. Package the chart"
mkdir -p "${PACKAGES_DIR}"
helm package "${CHART_PATH}" --destination "${PACKAGES_DIR}"
PACKAGE="$(ls -1 "${PACKAGES_DIR}"/hello-*.tgz | tail -1)"
echo "Created ${PACKAGE}"

section "6. Roll back to revision 1"
helm rollback "${RELEASE_NAME}" 1
kubectl rollout status deployment/"${RELEASE_NAME}" --timeout=120s
curl -s "http://localhost:${HOST_PORT}" || true
echo ""

section "7. Release history"
helm history "${RELEASE_NAME}"

echo ""
echo "Demo complete. Run ./shell/shutdown.sh to tear down the cluster."
