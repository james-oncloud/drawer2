# Helm chart: nginx-learning

Educational chart that deploys NGINX plus two Spring Boot backends
(`users-service`, `orders-service`) into Kubernetes.

## Quick start

Build and load images first (see the root README), then:

```bash
helm lint ./helm/nginx-learning

helm template nginx-learning ./helm/nginx-learning

helm install nginx-learning ./helm/nginx-learning \
  --namespace nginx-learning \
  --create-namespace
```

Access with:

```bash
kubectl port-forward service/nginx 8080:80 -n nginx-learning
curl http://localhost:8080/users/123
```

## Values

| Path | Meaning |
|------|---------|
| `namespace.name` | Target namespace |
| `nginx.replicaCount` | NGINX Pod replicas |
| `users.replicaCount` | Users Pod replicas (scale to demo LB) |
| `orders.replicaCount` | Orders Pod replicas |
| `*.image.*` | Image repository / tag / pullPolicy |
| `*.service.port` | Service ports (also used in NGINX upstream) |
| `*.resources` | CPU/memory requests and limits |

## Overrides

**`--set`** — one-off CLI overrides:

```bash
helm install nginx-learning ./helm/nginx-learning \
  --namespace nginx-learning \
  --create-namespace \
  --set users.replicaCount=2 \
  --set orders.replicaCount=2
```

**`-f values-local.yaml`** — file of overrides (preferred for several knobs):

```bash
helm upgrade --install nginx-learning ./helm/nginx-learning \
  -f values-local.yaml \
  --namespace nginx-learning \
  --create-namespace
```

| Mechanism | Role |
|-----------|------|
| `values.yaml` | Chart defaults |
| `-f file.yaml` | Layer of overrides (can use multiple `-f`) |
| `--set key=value` | Highest-priority one-off overrides |

## Upgrade / uninstall

```bash
helm upgrade nginx-learning ./helm/nginx-learning --namespace nginx-learning
helm uninstall nginx-learning --namespace nginx-learning
```

## How NGINX config is generated

`templates/nginx-configmap.yaml` embeds `nginx.conf` and injects:

```nginx
server {{ include "nginx-learning.usersServiceName" . }}:{{ .Values.users.service.port }};
```

So changing `users.service.port` in values updates both the Service and the upstream.
