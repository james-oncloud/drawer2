#!/usr/bin/env bash
set -euo pipefail

NODE="$(kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.metadata.labels.disktype}{"\n"}{end}' | awk '$2=="ssd"{print $1; exit}')"
if [[ -z "${NODE}" ]]; then
  NODE="$(kubectl get nodes -o jsonpath='{.items[1].metadata.name}')"
fi

echo "==> Tainting node ${NODE} with dedicated=gpu:NoSchedule"
kubectl taint nodes "${NODE}" dedicated=gpu:NoSchedule --overwrite
