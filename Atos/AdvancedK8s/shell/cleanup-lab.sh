#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LAB="${1:-}"

usage() {
  echo "Usage: $0 <lab-directory-name>" >&2
  exit 1
}

[[ -n "${LAB}" ]] || usage
LAB_DIR="${ROOT}/labs/${LAB}"
[[ -d "${LAB_DIR}" ]] || usage

if [[ -x "${LAB_DIR}/teardown.sh" ]]; then
  echo "==> Running lab teardown"
  "${LAB_DIR}/teardown.sh"
fi

kubectl delete -f "${LAB_DIR}/broken.yaml" --ignore-not-found
echo "==> Lab ${LAB} removed"
