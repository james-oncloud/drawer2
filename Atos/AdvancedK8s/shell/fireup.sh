#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLUSTER_NAME="${CLUSTER_NAME:-advanced-k8s}"
KIND_CONFIG="${ROOT}/kind-config.yaml"

require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require docker
require kind
require kubectl

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Start Docker Desktop and retry." >&2
  exit 1
fi

if ! kind get clusters 2>/dev/null | grep -qx "${CLUSTER_NAME}"; then
  echo "==> Creating kind cluster: ${CLUSTER_NAME}"
  kind create cluster --name "${CLUSTER_NAME}" --config "${KIND_CONFIG}"
else
  echo "==> Kind cluster already exists: ${CLUSTER_NAME}"
  kubectl cluster-info --context "kind-${CLUSTER_NAME}" >/dev/null
fi

echo "==> Applying baseline namespace and working reference deployment"
kubectl apply -f "${ROOT}/baseline/"

echo "==> Waiting for baseline rollout"
kubectl rollout status deployment/web -n k8s-lab --timeout=120s

echo ""
echo "==> Cluster ready"
echo "    context: kind-${CLUSTER_NAME}"
echo "    namespace: k8s-lab"
echo ""
kubectl get nodes -L lab-zone,disktype,node-role
echo ""
kubectl get pods,svc -n k8s-lab
echo ""
echo "Next steps:"
echo "  cd ${ROOT}"
echo "  ./shell/apply-lab.sh 01-node-selector-trap"
echo "  cat labs/01-node-selector-trap/README.md"
echo ""
