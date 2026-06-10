#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=shell/bootstrap.sh
source "${ROOT}/shell/bootstrap.sh"

CLUSTER_NAME="${CLUSTER_NAME:-helm-demo}"
RELEASE_NAME="${RELEASE_NAME:-hello}"
CHART_PATH="${ROOT}/chart/hello"
HOST_PORT="${HOST_PORT:-18080}"

if k3d cluster list 2>/dev/null | grep -q "${CLUSTER_NAME}"; then
  echo "Cluster '${CLUSTER_NAME}' already exists — reusing it."
else
  echo "Creating k3d cluster '${CLUSTER_NAME}' (Kubernetes in Docker)..."
  k3d cluster create "${CLUSTER_NAME}" \
    --agents 0 \
    -p "${HOST_PORT}:80@loadbalancer" \
    --wait
fi

export KUBECONFIG
KUBECONFIG="$(k3d kubeconfig write "${CLUSTER_NAME}")"

echo ""
echo "Installing Helm release '${RELEASE_NAME}' from ${CHART_PATH}..."
if helm status "${RELEASE_NAME}" >/dev/null 2>&1; then
  helm upgrade "${RELEASE_NAME}" "${CHART_PATH}"
else
  helm install "${RELEASE_NAME}" "${CHART_PATH}"
fi

echo ""
echo "Waiting for deployment..."
kubectl rollout status deployment/"${RELEASE_NAME}" --timeout=120s

echo "Waiting for load balancer..."
for _ in $(seq 1 30); do
  if curl -sf "http://localhost:${HOST_PORT}" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo ""
helm status "${RELEASE_NAME}"
echo ""
echo "Demo is ready:"
echo "  App:    http://localhost:${HOST_PORT}"
echo "  Chart:  ${CHART_PATH}"
echo ""
echo "Try:"
echo "  curl http://localhost:${HOST_PORT}"
echo "  helm get values ${RELEASE_NAME}"
echo "  ${ROOT}/shell/demo.sh"
echo ""
echo "Teardown: ${ROOT}/shell/shutdown.sh"
