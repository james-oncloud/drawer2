#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LAB_DIR="${ROOT}/labs/09-rolling-update-rollback"

kubectl apply -f "${ROOT}/baseline/namespace.yaml"
kubectl apply -f "${LAB_DIR}/broken-v1.yaml"
kubectl rollout status deployment/rollout-lab -n k8s-lab --timeout=120s

echo "==> v1 is healthy. Deploying broken v2..."
kubectl apply -f "${LAB_DIR}/broken-v2.yaml"

echo ""
echo "Watch the rollout stall:"
echo "  kubectl rollout status deployment/rollout-lab -n k8s-lab"
echo "  kubectl get rs -n k8s-lab -l app=rollout-lab"
echo "  kubectl describe deployment rollout-lab -n k8s-lab"
echo ""
