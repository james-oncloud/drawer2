#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LAB="${1:-}"

usage() {
  echo "Usage: $0 <lab-directory-name>" >&2
  echo "Example: $0 01-node-selector-trap" >&2
  ls -1 "${ROOT}/labs" 2>/dev/null || true
  exit 1
}

[[ -n "${LAB}" ]] || usage
LAB_DIR="${ROOT}/labs/${LAB}"
[[ -d "${LAB_DIR}" ]] || usage

echo "==> Applying lab: ${LAB}"
kubectl apply -f "${ROOT}/baseline/namespace.yaml"
kubectl apply -f "${LAB_DIR}/broken.yaml"

if [[ -x "${LAB_DIR}/setup.sh" ]]; then
  echo "==> Running lab setup"
  "${LAB_DIR}/setup.sh"
fi

echo ""
echo "Lab deployed. Read the scenario:"
echo "  cat ${LAB_DIR}/README.md"
echo ""
echo "Start debugging:"
echo "  kubectl get pods -n k8s-lab"
echo "  kubectl describe pod -n k8s-lab <pod-name>"
echo "  kubectl get events -n k8s-lab --sort-by='.lastTimestamp'"
echo ""
