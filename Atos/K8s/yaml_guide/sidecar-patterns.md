# Sidecar Patterns in Kubernetes

A **sidecar** is a helper container that runs beside your main application container **in the same Pod**. They share the Pod’s network namespace and can share volumes, so the sidecar can assist without the app knowing much about the infrastructure.

```
Pod
├── container: app          ← primary workload
└── container: sidecar      ← helper (logs, proxy, sync, …)
```

Sidecars are a **composition** pattern: extend behavior by adding a container, not by baking more agents into every app image.

---

## Why sidecars exist

| Goal | How a sidecar helps |
|------|---------------------|
| Keep app images lean | Move cross-cutting concerns out of the app binary |
| Share fate with the app | Same Pod → same node, IP, lifecycle boundary |
| Local communication | Talk over `localhost` or a shared volume (fast, no Service hop) |
| Independent release | Update the helper image without rebuilding the app (and vice versa) |

---

## Two ways to run sidecars

### 1. Classic multi-container Pod (traditional)

Both containers are listed under `spec.containers`. Kubernetes treats them as peers: the Pod is “ready” when **all** containers with readiness probes are ready; if either exits, restart policy applies to that container.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: ghcr.io/example/web:1.2.3
          ports:
            - containerPort: 8080
          volumeMounts:
            - name: logs
              mountPath: /var/log/app

        - name: log-shipper          # classic sidecar
          image: fluent/fluent-bit:3.0
          volumeMounts:
            - name: logs
              mountPath: /var/log/app
              readOnly: true

      volumes:
        - name: logs
          emptyDir: {}
```

**Characteristics**

- Simple and widely supported on every cluster version
- Sidecar start/stop is **not** ordered relative to the app (race possible)
- Job completion semantics are awkward: Pod stays up until *all* containers exit
- Probes / resource accounting must include the sidecar

### 2. Native sidecar containers (Kubernetes 1.28+)

Mark a container as a sidecar by placing it in `initContainers` with `restartPolicy: Always`. It starts **before** main containers, can be kept running for the Pod lifetime, and is shut down **after** main containers finish (better for Jobs and graceful drain).

```yaml
spec:
  initContainers:
    - name: proxy
      image: envoyproxy/envoy:v1.30.0
      restartPolicy: Always          # ← makes this a native sidecar
      ports:
        - containerPort: 15001
      resources:
        requests:
          cpu: 50m
          memory: 64Mi

  containers:
    - name: web
      image: ghcr.io/example/web:1.2.3
      ports:
        - containerPort: 8080
```

**Characteristics**

- Ordered startup: native sidecars become ready first
- Ordered shutdown: main app stops, then sidecars
- Better fit for batch `Job`s (sidecar does not block Job completion the same way)
- Requires a recent enough cluster / kubelet (feature graduated over 1.28–1.33 era — check your version)

Prefer **native sidecars** on modern clusters; use **classic** multi-container when you need maximum compatibility.

---

## Shared Pod resources (what sidecars can use)

| Shared | Useful for |
|--------|------------|
| Network namespace (`localhost`) | Proxies, local metrics scrapes, gRPC to a helper on another port |
| Volumes (`emptyDir`, ConfigMaps, Secrets, PVCs) | Log shipping, config reload, shared caches |
| Pod IP / DNS name | External callers still hit the Pod; sidecar can intercept or observe |
| Security context / ServiceAccount | Helper uses same identity unless you isolate further |

Sidecars do **not** get a separate Pod IP. From outside the cluster you usually still expose the **app** (or mesh proxy) via a `Service`.

---

## Common use-cases

### 1. Log shipping / aggregation

App writes logs to a file or stdout; a sidecar tails files and forwards to Elasticsearch, Loki, CloudWatch, etc.

```
app → /var/log/app/*.log → fluent-bit sidecar → logging backend
```

**When:** legacy apps that only log to disk; need enrichment/filtering next to the process.  
**Alternative:** node-level agents (DaemonSet) for stdout/stderr-only apps.

### 2. Service mesh / network proxy

Envoy, Linkerd-proxy, Istio sidecar (or ambient alternatives) handle mTLS, retries, traffic split, observability.

```
caller → sidecar proxy → app:8080
```

**When:** uniform security and traffic policy without changing app code.  
**Trade-off:** extra hop, CPU/RAM per Pod, operational complexity.

### 3. Adapters / protocol translation

Sidecar speaks a protocol the platform understands (HTTP, gRPC health, Prometheus) while the app speaks something else (legacy TCP, vendor API).

**When:** wrapping a third-party binary you cannot modify.

### 4. Ambassadors (outbound helper)

Sidecar owns outbound connections: connection pooling, auth to a remote API, multi-datacenter fan-out. App talks only to `localhost`.

```
app → localhost:9376 (ambassador) → external systems
```

**When:** centralize credentials and retry logic next to many language runtimes.

### 5. Config / secret sync

Sidecar watches a store (Vault, AWS Secrets Manager, git) and refreshes files on a shared volume; app reloads or re-reads files.

**When:** short-lived credentials or dynamic config without rebuilding images.  
**Alternative:** CSI secrets store driver, native kube Secrets (less dynamic).

### 6. Metrics / observability exporters

Sidecar scrapes a local non-Prometheus endpoint or exposes JMX/StatsD as Prometheus metrics on another port.

**When:** app cannot expose `/metrics` itself.

### 7. Security / policy agents

Local policy enforcement, runtime sensors, or encryption helpers (e.g. encrypting volume data) living beside the app.

**When:** compliance controls must sit in-process path but outside app code.  
**Caution:** privilege and blast radius — keep capabilities minimal.

### 8. Data sync / cache warmers

Sidecar pulls assets, ML models, or feature flags into a shared volume before or while the app runs (sometimes as an init container instead).

**When:** large artifacts should not live in the app image.

### 9. Service backup / stub for Jobs

For batch Jobs, a native sidecar can provide a local dependency (e.g. local proxy) that terminates cleanly when the main container finishes.

---

## Sidecar vs related patterns

| Pattern | Where it runs | Typical role |
|---------|---------------|--------------|
| **Sidecar** | Same Pod as app | Per-instance helper |
| **Init container** | Same Pod, runs first, exits | One-shot setup |
| **DaemonSet agent** | One Pod per node | Node-wide logs/metrics/CNI |
| **Ambassador** (subtype of sidecar) | Same Pod | Outbound proxy/helper |
| **Adapter** (subtype of sidecar) | Same Pod | Present a uniform interface outward |
| **Service mesh ambient / node proxy** | Node or shared namespace | Mesh without per-Pod sidecar |

Classic literature (Microsoft / CNCF blogs) often names three multi-container patterns: **sidecar**, **ambassador**, and **adapter**. In Kubernetes they are all “extra containers in the Pod”; the difference is *direction of responsibility* (observe/extend vs outbound vs interface shape).

---

## Design guidelines

1. **One concern per sidecar** — prefer a focused helper over a mega-sidecar.
2. **Size resources explicitly** — sidecars need their own `requests`/`limits`; they count toward Pod scheduling.
3. **Probe the right container** — readiness should reflect whether *traffic* can be served (app, or proxy if it fronts the app).
4. **Share only what you must** — read-only mounts for logs/config; avoid writable shared state races.
5. **Prefer stdout + node agents** when that meets the need — fewer containers to patch and tune.
6. **Watch version skew** — pin sidecar images; mesh sidecars especially must stay compatible with the control plane.
7. **Jobs: prefer native sidecars** — classic sidecars often keep Jobs from completing.

---

## Minimal decision guide

```
Need help beside every app replica?
  ├─ Yes, per Pod ................. sidecar (classic or native)
  ├─ Yes, but once per node ....... DaemonSet
  ├─ Only before app starts ....... init container
  └─ Cross-cutting for all traffic  mesh / Gateway / Ingress
```

---

## Pros and cons

**Pros**

- Reuse helpers across languages and teams
- Independent image lifecycle from the app
- Tight `localhost` / volume coupling

**Cons**

- More images to scan, patch, and resource-tune
- Harder debugging (which container failed?)
- Startup ordering / readiness coupling (improved with native sidecars)
- “Sidecar tax” on CPU/memory at scale (famous mesh pain point)

---

## Quick reference snippets

**Shared volume log shipper** — see classic example above.

**Localhost metrics exporter**

```yaml
containers:
  - name: app
    image: myapp:1.0
    ports:
      - containerPort: 8080
  - name: exporter
    image: prom/statsd-exporter:v0.26.0
    ports:
      - containerPort: 9102   # scrape this via Pod annotation / ServiceMonitor
```

**Native sidecar proxy (sketch)**

```yaml
initContainers:
  - name: envoy
    image: envoyproxy/envoy:v1.30.0
    restartPolicy: Always
    # ... config volume, probes, resources ...
containers:
  - name: app
    image: myapp:1.0
```

---

## Related docs in this guide

- [deployment-anatomy.md](deployment-anatomy.md) — where containers sit in a Deployment
- [deployment-complete-example.md](deployment-complete-example.md) — full Deployment including a sidecar container
- [k8s-kinds.md](k8s-kinds.md) — workload kinds that host Pod templates

---

## Further reading

- Kubernetes docs: [Sidecar containers](https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/)
- Kubernetes docs: [Multiple containers](https://kubernetes.io/docs/concepts/workloads/pods/#how-pods-manage-multiple-containers)
- Pattern background: multi-container Pod patterns (sidecar / ambassador / adapter)
