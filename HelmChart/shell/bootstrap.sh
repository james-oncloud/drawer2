#!/usr/bin/env bash
# Download helm and k3d into ./bin when not already on PATH.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BIN="${ROOT}/bin"
mkdir -p "${BIN}"

export PATH="${BIN}:${PATH}"

HELM_VERSION="${HELM_VERSION:-v3.17.3}"
K3D_VERSION="${K3D_VERSION:-v5.8.3}"

os="$(uname -s | tr '[:upper:]' '[:lower:]')"
arch="$(uname -m)"
case "${arch}" in
  x86_64)  arch="amd64" ;;
  aarch64|arm64) arch="arm64" ;;
  *)
    echo "Unsupported architecture: ${arch}" >&2
    exit 1
    ;;
esac

download() {
  local url="$1"
  local dest="$2"
  if [[ -x "${dest}" ]]; then
    return 0
  fi
  echo "Downloading $(basename "${dest}")..."
  curl -fsSL "${url}" -o "${dest}.tmp"
  chmod +x "${dest}.tmp"
  mv "${dest}.tmp" "${dest}"
}

ensure_helm() {
  if command -v helm >/dev/null 2>&1; then
    return 0
  fi
  local dest="${BIN}/helm"
  download "https://get.helm.sh/helm-${HELM_VERSION}-${os}-${arch}.tar.gz" "${dest}.tgz"
  tar -xzf "${dest}.tgz" -C "${BIN}" --strip-components=1 "${os}-${arch}/helm"
  rm -f "${dest}.tgz"
}

ensure_k3d() {
  if command -v k3d >/dev/null 2>&1; then
    return 0
  fi
  download "https://github.com/k3d-io/k3d/releases/download/${K3D_VERSION}/k3d-${os}-${arch}" "${BIN}/k3d"
}

ensure_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is required. Install Docker Desktop or Docker Engine." >&2
    exit 1
  fi
  if ! docker info >/dev/null 2>&1; then
    echo "Docker daemon is not running. Start Docker and try again." >&2
    exit 1
  fi
}

ensure_docker
ensure_helm
ensure_k3d

echo "Using helm: $(command -v helm) ($(helm version --short))"
echo "Using k3d:  $(command -v k3d) ($(k3d version | head -1))"
