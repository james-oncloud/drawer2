# Deployment YAML Anatomy

A `Deployment` is the usual way to run a long-lived app in Kubernetes. You declare the desired state; the control plane creates a `ReplicaSet`, which creates and replaces `Pod`s.

```
Deployment
  └── ReplicaSet (revision)
        └── Pod(s) matching the template
```

---

## Minimal example

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello
  labels:
    app: hello
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hello
  template:
    metadata:
      labels:
        app: hello
    spec:
      containers:
        - name: hello
          image: nginx:1.27
          ports:
            - containerPort: 80
```

---

## Top-level fields

Every Kubernetes object starts the same way:

| Field | Required | Meaning |
|-------|----------|---------|
| `apiVersion` | yes | API group/version. Deployments use `apps/v1` |
| `kind` | yes | Always `Deployment` |
| `metadata` | yes | Name, namespace, labels, annotations |
| `spec` | yes | Desired state you declare |
| `status` | no (server-set) | Live state filled in by the cluster; omit in files you apply |

---

## `metadata` — identity of the Deployment

```yaml
metadata:
  name: hello                 # required; unique within the namespace
  namespace: default           # optional; defaults to "default"
  labels:                     # optional; for organizing / selecting this Deployment
    app: hello
    tier: frontend
  annotations:                # optional; non-identifying metadata
    description: "demo app"
```

| Field | Notes |
|-------|--------|
| `name` | Primary identifier. Used by `kubectl get deploy hello` |
| `namespace` | Scope. Must exist before you apply |
| `labels` | Key/value tags on the *Deployment object itself* (not necessarily the Pods) |
| `annotations` | Free-form notes; tools often store config here |

---

## `spec` — what you want

```yaml
spec:
  replicas: 3
  selector: { ... }
  template: { ... }
  strategy: { ... }           # optional
  minReadySeconds: 0          # optional
  revisionHistoryLimit: 10    # optional
  progressDeadlineSeconds: 600
```

### `replicas`

How many Pods should run.

- Default if omitted: `1`
- Changed by you, or by an `HorizontalPodAutoscaler` if one targets this Deployment

### `selector` — which Pods belong to this Deployment

```yaml
selector:
  matchLabels:
    app: hello
```

| Rule | Why it matters |
|------|----------------|
| Must match labels on `template.metadata.labels` | Otherwise the Deployment cannot adopt its own Pods |
| Should stay stable after create | Changing the selector is not allowed (or is very constrained) |

`matchLabels` is an AND of all listed labels. You can also use `matchExpressions` for richer rules.

### `template` — the Pod blueprint

This is a **Pod template**, not a standalone Pod. It has nested `metadata` + `spec`:

```yaml
template:
  metadata:
    labels:
      app: hello              # must satisfy the Deployment selector
  spec:                       # PodSpec — same shape as kind: Pod
    containers:
      - name: hello
        image: nginx:1.27
```

Everything under `template.spec` is Pod scheduling/runtime config (containers, volumes, probes, etc.). See [Pod template section](#pod-template-spec-common-fields) below.

### `strategy` — how updates roll out

```yaml
strategy:
  type: RollingUpdate          # or Recreate
  rollingUpdate:
    maxUnavailable: 25%        # Pods that may be down during update
    maxSurge: 25%              # Extra Pods allowed above replicas
```

| Type | Behavior |
|------|----------|
| `RollingUpdate` (default) | Bring up new Pods, drain old ones gradually |
| `Recreate` | Kill all old Pods, then create new ones (downtime) |

---

## Pod template `spec` — common fields

These live under `spec.template.spec`:

```yaml
spec:
  template:
    spec:
      serviceAccountName: default
      restartPolicy: Always       # Deployments must use Always
      containers:
        - name: app
          image: myapp:1.2.3
          imagePullPolicy: IfNotPresent
          ports:
            - name: http
              containerPort: 8080
          env:
            - name: LOG_LEVEL
              value: info
          envFrom:
            - configMapRef:
                name: app-config
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 256Mi
          readinessProbe:
            httpGet:
              path: /ready
              port: http
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /healthz
              port: http
          volumeMounts:
            - name: data
              mountPath: /var/lib/app
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: app-pvc
```

| Area | Fields | Role |
|------|--------|------|
| Container identity | `name`, `image`, `imagePullPolicy`, `command`, `args` | What runs |
| Networking | `ports.containerPort` | Documents the port the process listens on (does not publish it by itself) |
| Config | `env`, `envFrom`, `volumeMounts` | Inject config/secrets/files |
| Resources | `resources.requests` / `limits` | Scheduling and throttling |
| Health | `readinessProbe`, `livenessProbe`, `startupProbe` | Traffic and restarts |
| Storage | `volumes` + `volumeMounts` | Disks, ConfigMaps, Secrets as files |
| Identity | `serviceAccountName` | RBAC identity for the Pod |

---

## Annotated full example

```yaml
apiVersion: apps/v1              # Deployment API
kind: Deployment
metadata:
  name: web                      # Deployment name
  namespace: demo
  labels:
    app: web
spec:
  replicas: 2                    # Desired Pod count
  selector:                      # How Deployment finds its Pods
    matchLabels:
      app: web
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  template:                      # Pod blueprint
    metadata:
      labels:
        app: web                 # Must match selector
    spec:
      containers:
        - name: web
          image: ghcr.io/example/web:1.0.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: 100m
              memory: 64Mi
```

---

## Fields you usually do *not* write

| Field | Who sets it |
|-------|-------------|
| `metadata.uid`, `resourceVersion`, `generation` | API server |
| `status` (replicas ready, conditions, etc.) | Deployment controller |
| `spec.template.metadata` owner refs on live Pods | Controllers after create |

Prefer applying clean desired-state YAML; let the cluster own `status`.

---

## Common pitfalls

1. **Selector / template label mismatch** — apply fails or Deployment never manages Pods.
2. **Changing `selector` after create** — blocked; recreate the Deployment instead.
3. **Only `containerPort`** — does not expose the app outside the cluster; pair with a `Service`.
4. **No `resources`** — Pods can be scheduled poorly or starve neighbors.
5. **`restartPolicy` other than `Always`** — invalid for Deployments.

---

## Inspect after apply

```bash
kubectl apply -f deployment.yaml
kubectl get deploy,rs,pods -l app=web
kubectl describe deploy web
kubectl explain deployment.spec          # field docs from the cluster
kubectl explain deployment.spec.template.spec.containers
```

---

## Related kinds

| Kind | Relationship to Deployment |
|------|----------------------------|
| `ReplicaSet` | Owned by the Deployment; one per revision |
| `Pod` | Created from `spec.template` |
| `Service` | Selects Pods (usually same labels as the template) |
| `HorizontalPodAutoscaler` | Adjusts `spec.replicas` |
| `PodDisruptionBudget` | Limits how many Pods can go down at once |

See also: [k8s-kinds.md](k8s-kinds.md)
