#!/usr/bin/env bash
set -euo pipefail

kubectl delete deployment rollout-lab -n k8s-lab --ignore-not-found
