# nginx-learning

A small, runnable project to learn **NGINX configuration**, then see the same architecture deployed with **Docker Compose**, **Kubernetes**, and **Helm**.

```text
                       /users/*
                          |
                          v
Client ---> NGINX ---> Users Service :8081

                       /orders/*
                          |
                          v
                  Orders Service :8082 ----> Stock Service :8083

                       /stock/*
                          |
                          v
                  Stock Service :8083
```

NGINX listens on port **80** and reverse-proxies to three tiny Spring Boot apps.  
`orders-service` also calls `stock-service` directly (service-to-service) when fetching an order.

---

## Learning progression

```text
Stage 1  Client -> NGINX -> Spring Boot          (concepts in nginx.conf)
Stage 2  Client -> NGINX -> Docker services      (docker compose up)
Stage 3  Client -> NGINX -> K8s Services -> Pods (kubectl apply -f k8s/)
Stage 4  Helm -> generates Kubernetes resources  (helm install)
```

---

## Project structure

```text
.
├── README.md
├── docker-compose.yml
├── values-local.yaml          # example Helm overrides
├── nginx/
│   ├── nginx.conf             # thoroughly commented
│   ├── html/telemetry/        # browser log viewer
│   └── logs/                  # NDJSON access logs (Compose bind-mount)
├── users-service/             # Spring Boot on :8081
├── orders-service/            # Spring Boot on :8082 (calls stock-service)
├── stock-service/             # Spring Boot on :8083
├── k8s/                       # raw Kubernetes manifests
└── helm/
    └── nginx-learning/        # Helm chart
```

---

## Request flow (end-to-end)

```text
Request
   ↓
NGINX :80
   ↓
server (listen 80)
   ↓
location matching (/users or /orders)
   ↓
proxy headers added (Host, X-Real-IP, X-Forwarded-*)
   ↓
upstream selected (users_backend / orders_backend)
   ↓
Kubernetes Service  (or Docker Compose DNS name)
   ↓
Spring Boot Pod / container
   ↓
response → NGINX → client
```

### Example: `GET /users/123`

1. Client calls `http://localhost/users/123` (Compose) or `http://localhost:8080/users/123` (K8s port-forward).
2. NGINX `server` on port 80 accepts the connection.
3. `location /users` matches.
4. `proxy_set_header` copies/sets forwarding headers.
5. `proxy_pass http://users_backend` sends the request to the `users_backend` upstream.
6. Upstream resolves `users-service:8081`:
   - **Compose:** Docker DNS → users-service container
   - **Kubernetes:** Service DNS → ClusterIP → one ready Pod
7. Spring Boot returns JSON including `service`, `pod` (hostname), and `userId`.
8. NGINX returns that response to the client.

---

## Stage 2 — Docker Compose

### Run

```bash
docker compose up --build
```

Compose builds both Spring Boot images, starts them, waits for healthchecks, then starts NGINX with `./nginx/nginx.conf` mounted at `/etc/nginx/nginx.conf`.

Only NGINX is required as the entry point (`localhost:80`). Backend ports `8081` / `8082` are also published for direct debugging.

### Curl tests

```bash
curl http://localhost/users
curl http://localhost/users/123

curl http://localhost/orders
curl http://localhost/orders/456
# getOrder calls stock-service; response includes stockDurationMs

curl http://localhost/stock
curl http://localhost/stock/456/update

# Fallback
curl http://localhost/unknown
# -> 404 Unknown endpoint
```

### Proxy header tests

```bash
curl http://localhost/users/debug
```

Expected fields (values will vary):

```json
{
  "service": "users-service",
  "pod": "<container-hostname>",
  "host": "localhost",
  "xRealIp": "<your-docker-bridge-or-client-ip>",
  "xForwardedFor": "<same or chain>",
  "xForwardedProto": "http",
  "remoteAddr": "..."
}
```

Send a client-supplied `X-Forwarded-For`; NGINX **appends** `$remote_addr` via `$proxy_add_x_forwarded_for`:

```bash
curl \
  -H "X-Forwarded-For: 1.2.3.4" \
  http://localhost/users/debug
```

Expect `xForwardedFor` similar to `1.2.3.4, <nginx-seen-client-ip>`.

### Telemetry access log + browser viewer

NGINX writes **NDJSON** access logs using a custom `log_format telemetry` that includes timing fields:

| Field | Meaning |
|-------|---------|
| `request_time` | Total time (seconds) to handle the request end-to-end |
| `upstream_response_time` | Time spent waiting on the backend only |
| `upstream_connect_time` / `upstream_header_time` | Upstream connect / header wait |
| `upstream_addr` / `upstream_status` | Backend address and status |

Open the viewer in a browser:

```text
http://localhost/telemetry/
```

Generate a few requests, then watch the table refresh (or open raw NDJSON at `http://localhost/telemetry/access.log`).

```bash
curl http://localhost/users/1
curl http://localhost/orders/42
curl http://localhost/telemetry/access.log
```

Host copy of the log file (Compose): `nginx/logs/access.log`.

> Learning-only: serving access logs over HTTP is convenient locally. Do not expose them this way in production.

Stop with `Ctrl+C` or `docker compose down`.

---

## Stage 3 — Kubernetes (raw manifests)

Requires a local cluster (Minikube, Docker Desktop Kubernetes, kind, etc.) and images available **inside** that cluster.

### Build / load images

**Docker Desktop Kubernetes** (same Docker daemon):

```bash
docker build -t users-service:latest ./users-service
docker build -t orders-service:latest ./orders-service
```

**Minikube** (images must be loaded into Minikube’s Docker):

```bash
eval $(minikube docker-env)
docker build -t users-service:latest ./users-service
docker build -t orders-service:latest ./orders-service
# optional: eval $(minikube docker-env -u)  # restore host docker-env
```

**kind:**

```bash
docker build -t users-service:latest ./users-service
docker build -t orders-service:latest ./orders-service
kind load docker-image users-service:latest
kind load docker-image orders-service:latest
```

### Deploy

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/
```

### Access (port-forward — simplest for learning)

```bash
kubectl port-forward service/nginx 8080:80 -n nginx-learning
```

Then:

```bash
curl http://localhost:8080/users
curl http://localhost:8080/users/123
curl http://localhost:8080/orders
curl http://localhost:8080/orders/456
curl http://localhost:8080/users/debug
```

`ClusterIP` keeps NGINX internal; port-forward tunnels your laptop to the Service. Alternatives: change `k8s/nginx-service.yaml` to `NodePort` or `LoadBalancer` if your cluster supports them.

### Verification

```bash
kubectl get pods -n nginx-learning
kubectl get services -n nginx-learning
kubectl get deployments -n nginx-learning
kubectl get configmaps -n nginx-learning

kubectl logs deployment/nginx -n nginx-learning
kubectl logs deployment/users-service -n nginx-learning
kubectl logs deployment/orders-service -n nginx-learning
```

### Verify Kubernetes DNS from the NGINX Pod

```bash
NGINX_POD=$(kubectl get pod -n nginx-learning -l app=nginx -o jsonpath='{.items[0].metadata.name}')

# Install tooling ephemerally (nginx image is minimal)
kubectl exec -n nginx-learning "$NGINX_POD" -- bash -c \
  'apt-get update -qq && apt-get install -y -qq dnsutils >/dev/null && \
   nslookup users-service && nslookup orders-service'
```

You should see ClusterIPs for `users-service` and `orders-service` — the same names used in the NGINX `upstream` blocks. NGINX never targets Pod IPs directly.

### ConfigMap → volume → file

```text
ConfigMap (nginx-config)
   ↓
Volume (nginx-config)
   ↓
NGINX Pod volumeMount
   ↓
/etc/nginx/nginx.conf
```

---

## Stage 4 — Helm

### Lint / render / install

```bash
helm lint ./helm/nginx-learning
helm template nginx-learning ./helm/nginx-learning

helm install nginx-learning ./helm/nginx-learning \
  --namespace nginx-learning \
  --create-namespace
```

If raw manifests are already applied, uninstall/delete them first, or use a different release/namespace, to avoid name collisions.

### Test (same as K8s)

```bash
kubectl port-forward service/nginx 8080:80 -n nginx-learning

curl http://localhost:8080/users/123
curl http://localhost:8080/orders/456
curl http://localhost:8080/users/debug
```

### Upgrade / uninstall

```bash
helm upgrade nginx-learning ./helm/nginx-learning --namespace nginx-learning
helm uninstall nginx-learning --namespace nginx-learning
```

### Overrides

**`--set`** (one-off):

```bash
helm install nginx-learning ./helm/nginx-learning \
  --namespace nginx-learning \
  --create-namespace \
  --set users.replicaCount=2 \
  --set orders.replicaCount=2
```

**`-f values-local.yaml`** (file; scales users to 3 for LB demo):

```bash
helm upgrade --install nginx-learning ./helm/nginx-learning \
  -f values-local.yaml \
  --namespace nginx-learning \
  --create-namespace
```

| Source | Role |
|--------|------|
| `values.yaml` | Chart defaults |
| `-f values-local.yaml` | Layered file overrides |
| `--set` | Highest-priority CLI overrides |

---

## Load balancing demonstration

Scale users and watch the `pod` field change across requests:

```bash
# Helm
helm upgrade nginx-learning ./helm/nginx-learning \
  --namespace nginx-learning \
  --set users.replicaCount=3

# or raw manifests
kubectl scale deployment/users-service --replicas=3 -n nginx-learning
```

```bash
kubectl port-forward service/nginx 8080:80 -n nginx-learning

for i in {1..10}; do
  curl -s http://localhost:8080/users/123
  echo
done
```

Example response:

```json
{
  "service": "users-service",
  "pod": "users-service-6d9cc7f4cb-x8abc",
  "userId": "123"
}
```

Different `pod` values mean:

```text
NGINX
   |
   v
users-service  (Kubernetes Service — stable DNS/ClusterIP)
   |
   +----> users Pod 1
   +----> users Pod 2
   +----> users Pod 3
```

**NGINX chooses the Kubernetes Service** (via one upstream server entry).  
**Kubernetes Service chooses the backend Pod** (kube-proxy / IPVS / endpoint routing).

NGINX does **not** list every Pod in this architecture.

---

## Trailing-slash behaviour (`proxy_pass`)

This is a common NGINX footgun. The **running** config uses **no** trailing slash on `proxy_pass`, so paths are preserved.

### Behaviour A — URI preserved (what this project uses)

```nginx
location /users {
    proxy_pass http://users_backend;   # no trailing slash
}
```

| Client request | Forwarded to backend |
|----------------|----------------------|
| `/users/123`   | `/users/123`         |
| `/users/debug` | `/users/debug`       |

### Behaviour B — prefix replaced (documented alternative)

```nginx
location /users/ {
    proxy_pass http://users_backend/;  # trailing slash on BOTH
}
```

NGINX replaces the matched location prefix `/users/` with `/`:

| Client request | Forwarded to backend (approx.) |
|----------------|--------------------------------|
| `/users/123`   | `/123`                         |
| `/users/debug` | `/debug`                       |

That would **break** this project’s Spring mappings (`/users/{id}`), which is why behaviour A is the live config. Comments in `nginx/nginx.conf` repeat this distinction.

---

## NGINX concepts

| Directive / variable | Meaning |
|----------------------|---------|
| `events` | Connection-handling settings for worker processes |
| `http` | Context for HTTP: upstreams, servers, logging, etc. |
| `server` | One virtual server (listener / “site”) |
| `listen` | Address/port the server accepts |
| `location` | Match URI path → choose action (proxy, return, …) |
| `proxy_pass` | Forward the request to an upstream or URL |
| `upstream` | Named group of one or more backend servers |
| `server` (in upstream) | One member of that backend group |
| `$host` | Host from the client request |
| `$remote_addr` | Immediate client IP seen by NGINX |
| `$proxy_add_x_forwarded_for` | Existing `X-Forwarded-For` + `$remote_addr` |
| `$scheme` | `http` or `https` as seen by NGINX |
| `proxy_set_header` | Set a header on the proxied request |

---

## Kubernetes concepts

| Object / idea | Meaning |
|---------------|---------|
| **Pod** | Smallest deployable unit; runs one or more containers |
| **Deployment** | Declares desired replicas and rolling updates for Pods |
| **Service** | Stable IP/DNS in front of Pods selected by labels |
| **ClusterIP** | Service reachable only inside the cluster |
| **ConfigMap** | Non-secret config data (here: `nginx.conf`) |
| **Volume** | Data mounted into a Pod (from ConfigMap, emptyDir, …) |
| **Volume mount** | Path inside the container where the volume appears |
| **Labels** | Key/value metadata on objects |
| **Selectors** | How a Service/Deployment finds matching Pods |
| **Replicas** | Desired Pod count |
| **Readiness probe** | When the Pod may receive traffic |
| **Liveness probe** | When the container should be restarted |
| **Requests** | Resources guaranteed for scheduling |
| **Limits** | Hard caps (CPU throttle / OOM kill) |
| **Kubernetes DNS** | Resolves Service names like `users-service` to ClusterIPs |

### NGINX upstream vs Kubernetes Service

Both can participate in load balancing, but they sit at different layers:

| Layer | Role in this project |
|-------|----------------------|
| NGINX `upstream` | Points at **one** stable name: the K8s Service (or Compose service) |
| Kubernetes Service | Spreads connections across **Pod endpoints** |

You *could* put multiple Pod IPs in an NGINX upstream, but then NGINX would need updating whenever Pods change. Using the Service keeps NGINX config stable.

---

## Helm concepts

| Concept | Meaning |
|---------|---------|
| **Chart** | Package of templates + default values |
| `Chart.yaml` | Chart metadata (name, version) |
| `values.yaml` | Default configuration knobs |
| **templates/** | Kubernetes YAML with Go template expressions |
| `_helpers.tpl` | Reusable named template snippets |
| **Release** | An installed instance of a chart (name + revision) |
| `helm install` | Create a release |
| `helm upgrade` | Apply a new revision |
| `helm template` | Render YAML locally (no cluster) |
| `helm lint` | Static checks on the chart |
| **Values overrides** | `--set` / `-f` change behaviour without editing templates |

---

## Backend API summary

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/users` | List demo |
| GET | `/users/{id}` | Echo user id + pod name |
| GET | `/users/debug` | Echo proxy headers |
| GET | `/orders` | List demo |
| GET | `/orders/{id}` | Echo order id + pod name |
| GET | `/orders/debug` | Echo proxy headers |

---

## Cleanup

```bash
# Compose
docker compose down

# Raw manifests
kubectl delete namespace nginx-learning

# Helm
helm uninstall nginx-learning --namespace nginx-learning
kubectl delete namespace nginx-learning   # if still present
```

---

## Intentionally out of scope

No databases, auth, TLS, Ingress controllers, service meshes, Kafka, Prometheus, Grafana, Terraform, or Argo CD — on purpose. Master this core relationship first:

```text
NGINX  ↔  Docker  ↔  Kubernetes  ↔  Helm
```
