#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="${ROOT}/app"
CHART_PATH="${ROOT}/helm/hello"
RELEASE_NAME="${RELEASE_NAME:-hello}"
SERVICE_NAME="${SERVICE_NAME:-${RELEASE_NAME}}"
IMAGE="${IMAGE:-hello-app:latest}"
SERVICE_PORT="${SERVICE_PORT:-8080}"

echo "==> Building Docker image: ${IMAGE}"
DOCKER_BUILDKIT=1 docker build -t "${IMAGE}" "${APP_DIR}"

echo "==> Deploying Helm release: ${RELEASE_NAME}"
helm upgrade --install "${RELEASE_NAME}" "${CHART_PATH}"

echo "==> Waiting for StatefulSet rollout..."
kubectl rollout status "statefulset/${RELEASE_NAME}" --timeout=120s

echo "==> Waiting for LoadBalancer..."
for _ in $(seq 1 60); do
  LB_HOST=$(kubectl get svc "${SERVICE_NAME}" -o jsonpath='{.status.loadBalancer.ingress[0].hostname}{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || true)
  if [ -n "${LB_HOST}" ]; then
    break
  fi
  sleep 2
done

if [ -z "${LB_HOST}" ]; then
  LB_HOST="localhost"
  echo "    (LoadBalancer pending — using localhost, typical on Docker Desktop)"
fi

APP_URL="http://${LB_HOST}:${SERVICE_PORT}/hello"

echo ""
echo "==> App ready (load-balanced across pods):"
echo "    ${APP_URL}"
echo ""
echo "    curl ${APP_URL}"
echo ""
