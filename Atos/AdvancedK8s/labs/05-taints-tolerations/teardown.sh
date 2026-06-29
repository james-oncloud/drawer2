#!/usr/bin/env bash
set -euo pipefail

kubectl get nodes -o name | while read -r node; do
  kubectl taint "${node}" dedicated- 2>/dev/null || true
done
