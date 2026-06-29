#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LAB="${1:-}"

usage() {
  echo "Usage: $0 <lab-number-prefix>" >&2
  echo "Example: $0 01-node-selector-trap" >&2
  exit 1
}

[[ -n "${LAB}" ]] || usage
SOLUTION="${ROOT}/solutions/${LAB}.yaml"
[[ -f "${SOLUTION}" ]] || {
  echo "No solution file: ${SOLUTION}" >&2
  exit 1
}

kubectl apply -f "${SOLUTION}"
echo "==> Solution applied for ${LAB}"
