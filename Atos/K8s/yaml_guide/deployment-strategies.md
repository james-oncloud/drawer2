# Kubernetes Deployment Strategies (with YAML)

In a `Deployment`, **strategy** controls how Pods are replaced when you change the Pod template (new image, env, etc.).

Kubernetes supports **two** built-in strategies on `Deployment.spec.strategy`:

| Strategy | Downtime | How it works |
|----------|----------|--------------|
| `RollingUpdate` (default) | Usually none | New Pods come up; old Pods go down gradually |
| `Recreate` | Yes | All old Pods killed first; then new Pods created |

Broader patterns such as **blue/green** and **canary** are not separate `strategy.type` values — you implement them with multiple Deployments, Services, and/or Ingress/mesh traffic split. Those are covered after the built-ins.

---

## 1. RollingUpdate (default)

Bring up new Pods while old ones are still running, then drain old Pods. Controlled by `maxUnavailable` and `maxSurge`.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  labels:
    app: web
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1          # max Pods that can be down during update
      maxSurge: 1                # max extra Pods above replicas
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
        version: v2
    spec:
      containers:
        - name: web
          image: ghcr.io/example/web:2.0.0
          ports:
            - containerPort: 8080
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5
```

### What `maxUnavailable` and `maxSurge` mean

Assume `replicas: 4`.

| Setting | Meaning |
|---------|---------|
| `maxUnavailable: 1` | At least 3 Pods must stay available |
| `maxSurge: 1` | At most 5 Pods total during the rollout |

You may use **integers** or **percentages** (`25%`, `50%`).

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 25%
    maxSurge: 25%
```

Defaults if omitted: `maxUnavailable: 25%`, `maxSurge: 25%`.

### Useful companions

```yaml
spec:
  minReadySeconds: 10            # Pod must stay ready this long before counted available
  progressDeadlineSeconds: 600   # rollout marked failed if stuck
  revisionHistoryLimit: 5        # ReplicaSets kept for rollback
```

### Rollout commands

```bash
kubectl set image deploy/web web=ghcr.io/example/web:2.0.0
kubectl rollout status deploy/web
kubectl rollout history deploy/web
kubectl rollout undo deploy/web
```

**Best for:** most stateless web/APIs where old and new versions can run together briefly.

**Avoid when:** two versions cannot share the same data store or protocol at once (use Recreate or blue/green).

---

## 2. Recreate

Kill all Pods from the old ReplicaSet, then create the new ones. Simple, but **downtime** between delete and ready.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: legacy-app
  labels:
    app: legacy-app
spec:
  replicas: 3
  strategy:
    type: Recreate
  selector:
    matchLabels:
      app: legacy-app
  template:
    metadata:
      labels:
        app: legacy-app
    spec:
      containers:
        - name: app
          image: ghcr.io/example/legacy:3.1.0
          ports:
            - containerPort: 8080
```

**Best for:**

- Apps that cannot run two versions at once (strict schema lock, exclusive file locks)
- Dev/test where downtime is fine
- Saving surge capacity (no extra Pods during update)

**Not ideal for:** production user-facing services that need continuous availability.

---

## Strategy comparison (built-in)

```
RollingUpdate (replicas=4, maxSurge=1, maxUnavailable=1)

  time →
  v1: ████ ████ ████ ████
  v1: ████ ████ ████ ░░░░     (one unavailable)
  v2:                ████     (one surge)
  v1: ████ ████ ░░░░
  v2:           ████ ████
  ...
  v2: ████ ████ ████ ████


Recreate

  v1: ████ ████ ████
  v1: ░░░░ ░░░░ ░░░░          (all gone)
  v2:                ████ ████ ████
```

---

## Patterns beyond `strategy.type`

These are **release patterns**, not Deployment strategy enums. You combine Deployments + Service/Ingress (or a mesh).

### 3. Blue / Green

Two full environments; switch traffic when green is healthy.

```yaml
# Blue — currently live
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
      color: blue
  template:
    metadata:
      labels:
        app: web
        color: blue
    spec:
      containers:
        - name: web
          image: ghcr.io/example/web:1.0.0
          ports:
            - containerPort: 8080
---
# Green — new version, warmed up with no (or little) traffic
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
      color: green
  template:
    metadata:
      labels:
        app: web
        color: green
    spec:
      containers:
        - name: web
          image: ghcr.io/example/web:2.0.0
          ports:
            - containerPort: 8080
---
# Service points at the active color (switch blue ↔ green to cut over)
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  selector:
    app: web
    color: blue          # change to green for cutover
  ports:
    - port: 80
      targetPort: 8080
```

**Cutover:** change the Service selector (or Ingress backend) from `color: blue` to `color: green`.

**Pros:** instant switch / instant rollback; full prod-like validation on green.  
**Cons:** ~2× capacity during the transition; need compatible data migrations.

---

### 4. Canary

Send a small fraction of traffic (or a few replicas) to the new version; expand if healthy.

**Simple replica-weight canary** (same Service selects both versions):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-stable
spec:
  replicas: 9                    # ~90% of Pods
  selector:
    matchLabels:
      app: web
      track: stable
  template:
    metadata:
      labels:
        app: web
        track: stable
    spec:
      containers:
        - name: web
          image: ghcr.io/example/web:1.0.0
          ports:
            - containerPort: 8080
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-canary
spec:
  replicas: 1                    # ~10% of Pods
  selector:
    matchLabels:
      app: web
      track: canary
  template:
    metadata:
      labels:
        app: web
        track: canary
    spec:
      containers:
        - name: web
          image: ghcr.io/example/web:2.0.0
          ports:
            - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  selector:
    app: web                     # hits stable + canary Pods
  ports:
    - port: 80
      targetPort: 8080
```

Traffic split ≈ replica ratio only if Pods are similar and the Service load-balances evenly. For precise % splits, header-based canaries, or automatic analysis, use **Ingress controllers**, **Gateway API**, **Istio/Linkerd**, or **Argo Rollouts** / **Flagger**.

**Example: Ingress canary annotation (NGINX Ingress Controller)**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-canary
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "10"   # 10% to this Ingress
spec:
  ingressClassName: nginx
  rules:
    - host: web.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-canary
                port:
                  number: 80
```

(The non-canary Ingress for `web-stable` remains the primary.)

---

### 5. Ramped / rolling with pause (manual gated rollout)

Still `RollingUpdate`, but pause mid-way to verify:

```bash
kubectl rollout pause deploy/web
# observe metrics / errors
kubectl rollout resume deploy/web
```

Or advance canary replicas manually: `1 → 3 → 9`, then retire stable.

---

### 6. A/B (header / cookie routing)

Not a Deployment strategy — route by request attributes (logged-in users, cookie, geo) to different Deployments. Needs Ingress/mesh support.

Sketch:

```yaml
# Two Services: web-a and web-b, each selecting its Deployment
# Ingress/mesh rules: cookie "ab=b" → web-b, else → web-a
```

---

## Choosing a strategy

```
Can old and new Pods run at the same time?
  ├─ No  → Recreate  (or blue/green with exclusive cutover)
  └─ Yes
       Need gradual exposure / metrics gate?
         ├─ No  → RollingUpdate
         ├─ Yes, simple → Canary (2 Deployments + Service)
         └─ Yes, precise → Ingress/mesh/Argo Rollouts
       Need instant switch + full parallel stack?
         └─ Blue/Green
```

| Goal | Approach |
|------|----------|
| Default production rollout | `RollingUpdate` |
| Exclusive single version | `Recreate` |
| Instant cutover / rollback | Blue/green |
| Test new version on real traffic | Canary |
| Experiment by user segment | A/B (Ingress/mesh) |

---

## Related Deployment fields (not strategies, but affect rollouts)

| Field | Role |
|-------|------|
| `replicas` | Desired Pod count |
| `minReadySeconds` | Delay before a Pod counts as available |
| `progressDeadlineSeconds` | Fail the rollout if no progress |
| `revisionHistoryLimit` | How many old ReplicaSets to keep |
| `paused: true` | Freeze rollouts |

Readiness probes are critical for RollingUpdate: traffic and “available” counts follow **ready** Pods.

---

## What Deployments do *not* provide natively

- Built-in traffic % split (use Ingress/Gateway/mesh/Rollouts)
- Automatic metric-based promotion/rollback (use Flagger, Argo Rollouts, CI)
- Ordered Pod identity / storage stickiness (use `StatefulSet` instead)

For progressive delivery beyond RollingUpdate/Recreate, look at **Argo Rollouts** (`kind: Rollout`) or **Flagger** — they add canary/blue-green as first-class CRDs.

---

## Related docs in this guide

- [deployment-anatomy.md](deployment-anatomy.md) — Deployment YAML structure
- [deployment-complete-example.md](deployment-complete-example.md) — full manifest including `strategy`
- [k8s-kinds.md](k8s-kinds.md) — Deployments vs StatefulSets vs DaemonSets
- [k8s-architecture.md](k8s-architecture.md) — controllers that drive rollouts

---

## Further reading

- [Deployments — strategy](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#strategy)
- [Performing a rolling update](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/)
- [Argo Rollouts](https://argoproj.github.io/rollouts/) (progressive delivery)
