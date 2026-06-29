# Deployment YAML — Complete Guide

A Deployment tells Kubernetes: **"Keep this many copies of this pod running, and roll out updates safely."**

This guide walks through every part of a Deployment manifest using the baseline example from this repo.

---

## The big picture

A Deployment is a controller. It watches its own spec, compares it to what is actually running, and fixes any gap.

```
You write desired state (YAML)
        ↓
Deployment controller reads it
        ↓
Creates / updates ReplicaSet(s)
        ↓
ReplicaSet creates Pods
        ↓
kubelet starts containers on nodes
```

You never create Pods directly in production. You create a Deployment; it creates Pods for you.

---

## YAML notation (30-second primer)

Kubernetes manifests are YAML. Three patterns cover almost everything:

**Maps** — key/value pairs, indented:

```yaml
metadata:
  name: web
  namespace: k8s-lab
```

**Lists** — items prefixed with `-`:

```yaml
containers:
  - name: nginx
    image: nginx:1.27-alpine
  - name: sidecar
    image: busybox:1.36
```

**Nesting** — indentation matters (use 2 spaces, never tabs):

```yaml
spec:
  template:
    spec:
      containers:
        - name: nginx
```

A `|` after a key means a multi-line string:

```yaml
command:
  - sh
  - -c
  - |
    echo "line one"
    echo "line two"
```

---

## Full annotated example

Here is the baseline Deployment from `baseline/deployment.yaml`, broken into layers.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  namespace: k8s-lab
  labels:
    app: web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: nginx
          image: nginx:1.27-alpine
          ports:
            - containerPort: 80
              name: http
          envFrom:
            - configMapRef:
                name: web-config
          resources:
            requests:
              cpu: 50m
              memory: 64Mi
            limits:
              cpu: 200m
              memory: 128Mi
          readinessProbe:
            httpGet:
              path: /
              port: http
            initialDelaySeconds: 2
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /
              port: http
            initialDelaySeconds: 5
            periodSeconds: 10
```

---

## Layer 1 — Identity (`apiVersion`, `kind`, `metadata`)

These fields answer: **what is this object, and what is it called?**

| Field | Required | Meaning |
|-------|----------|---------|
| `apiVersion` | yes | Which Kubernetes API to use. Deployments use `apps/v1`. |
| `kind` | yes | Object type. Always `Deployment` here. |
| `metadata.name` | yes | Unique name within the namespace. |
| `metadata.namespace` | no | Which namespace. Defaults to `default` if omitted. |
| `metadata.labels` | no | Tags for organizing and selecting objects. |

```yaml
apiVersion: apps/v1    # "use the apps API, version 1"
kind: Deployment     # "this object is a Deployment"
metadata:
  name: web          # kubectl get deployment web
  namespace: k8s-lab
  labels:
    app: web         # arbitrary key/value — useful for filtering
```

Labels on the Deployment itself are for **you** (and other tools). They are separate from the selector labels that control which Pods the Deployment owns.

---

## Layer 2 — Desired state (`spec`)

Everything under `spec:` is what the controller tries to make true.

### `replicas`

How many identical Pods to run.

```yaml
spec:
  replicas: 2   # always try to keep 2 pods running
```

If a Pod dies, the controller creates a replacement. If you `kubectl scale deployment web --replicas=5`, you change desired state and the controller catches up.

---

### `selector` — how the Deployment finds its Pods

The Deployment must declare which Pods it owns. It does this with label matching.

```yaml
spec:
  selector:
    matchLabels:
      app: web
```

**Rule:** Every label in `selector.matchLabels` must also appear on the Pod template (see `template.metadata.labels` below). If they do not match, Kubernetes rejects the manifest.

```
Deployment selector:  app=web
Pod template labels:  app=web   ✓ match — Deployment owns these pods
Pod template labels:  app=webapp ✗ rejected at apply time
```

This is the trap in Lab 08 (Service routing) — selectors must match exactly.

---

### `strategy` — how updates roll out

When you change the image or any pod spec field, the Deployment creates a new ReplicaSet and migrates Pods.

```yaml
spec:
  strategy:
    type: RollingUpdate          # replace pods gradually (default)
    rollingUpdate:
      maxSurge: 1                # at most 1 extra pod above replicas during update
      maxUnavailable: 0          # never drop below full capacity during update
```

| Field | What it controls |
|-------|------------------|
| `type: RollingUpdate` | New pods come up before old ones go away (default). |
| `type: Recreate` | Kill all old pods first, then start new ones. Brief downtime. |
| `maxSurge` | How many extra pods allowed during rollout. `1` or `25%`. |
| `maxUnavailable` | How many pods can be down during rollout. `0` = zero-downtime. |

With `replicas: 2`, `maxSurge: 1`, `maxUnavailable: 0` during an update you might briefly see 3 pods (2 old + 1 new) until the new one is ready, then an old one is removed.

---

### `template` — the Pod blueprint

This is the most important section. It describes **one Pod**; the Deployment stamps out `replicas` copies.

The template has the same shape as a standalone Pod manifest:

```yaml
spec:
  template:           # "every pod I create should look like this"
    metadata:         # pod-level metadata
      labels:
        app: web
    spec:             # pod-level spec
      containers: [...]
```

Think of it as a cookie cutter. `replicas: 2` means cut two identical cookies.

---

## Layer 3 — Pod template metadata

```yaml
template:
  metadata:
    labels:
      app: web
```

| Field | Purpose |
|-------|---------|
| `labels` | Must include everything in `selector.matchLabels`. Also used by Services to route traffic. |
| `annotations` | Non-identifying metadata (build version, git SHA, etc.). Not used for selection. |

A Service routes to Pods by matching these labels:

```yaml
# Service elsewhere in the cluster
spec:
  selector:
    app: web    # must match template.metadata.labels
```

---

## Layer 4 — Pod spec (`template.spec`)

This is where the container actually runs. Fields here apply to every Pod the Deployment creates.

### `containers` (required)

A list of containers in the Pod. Most Deployments have one.

```yaml
containers:
  - name: nginx              # unique within the pod
    image: nginx:1.27-alpine # image:tag from a registry
```

| Field | Required | Meaning |
|-------|----------|---------|
| `name` | yes | Identifier for logs, probes, and `kubectl exec`. |
| `image` | yes | Container image. Format: `registry/repo:tag`. |
| `imagePullPolicy` | no | `IfNotPresent` (default), `Always`, or `Never`. |
| `command` | no | Override the image entrypoint. |
| `args` | no | Arguments passed to the command. |
| `ports` | no | Declares which ports the container listens on. |

**Ports** — documenting ports helps Services and probes find the right target:

```yaml
ports:
  - containerPort: 80   # port inside the container
    name: http          # reference by name in probes and services
    protocol: TCP       # optional, defaults to TCP
```

---

### `resources` — CPU and memory

```yaml
resources:
  requests:          # used by the scheduler to place the pod
    cpu: 50m         # 50 millicores = 0.05 of one CPU
    memory: 64Mi     # 64 mebibytes
  limits:            # maximum the container can use
    cpu: 200m
    memory: 128Mi
```

| | Requests | Limits |
|---|----------|--------|
| **Who reads it** | Scheduler | kubelet / container runtime |
| **Effect** | "I need at least this much to run" | "Kill me if I exceed this" |
| **Too high** | Pod stays `Pending` (Lab 02) | — |
| **Too low** | Pod schedules but may be slow | Container throttled or OOM-killed |

CPU units: `1` = one core, `100m` = 0.1 core, `50m` = 0.05 core.

Memory units: `Ki`, `Mi`, `Gi` (powers of 2) or `K`, `M`, `G` (powers of 10). Prefer `Mi`/`Gi`.

---

### `env` and `envFrom` — configuration

Inject environment variables from literals, ConfigMaps, or Secrets.

```yaml
# Single variable from a ConfigMap key
env:
  - name: DATABASE_URL
    valueFrom:
      configMapKeyRef:
        name: app-config
        key: DATABASE_URL

# Load all keys from a ConfigMap as env vars
envFrom:
  - configMapRef:
      name: web-config
```

A typo in the key name will not fail at apply time — the pod starts with an empty value and may crash at runtime (Lab 06).

---

### `readinessProbe` — "can this pod receive traffic?"

Kubernetes only sends traffic to a pod when the readiness probe passes.

```yaml
readinessProbe:
  httpGet:
    path: /
    port: http          # uses the named port from containers.ports
  initialDelaySeconds: 2   # wait before first check
  periodSeconds: 5         # check every 5 seconds
  failureThreshold: 3      # fail after 3 consecutive failures (default)
```

While failing: Pod stays `Running` but is removed from Service endpoints. No traffic routed to it.

---

### `livenessProbe` — "is this container still alive?"

If the liveness probe fails, Kubernetes **restarts the container**.

```yaml
livenessProbe:
  httpGet:
    path: /
    port: http
  initialDelaySeconds: 5
  periodSeconds: 10
```

A wrong path (e.g. `/healthz` when nginx only serves `/`) causes endless restarts even though the app is fine (Lab 07).

**Probe types:**

| Type | Example use |
|------|-------------|
| `httpGet` | Web apps — check an HTTP endpoint |
| `tcpSocket` | Databases, anything listening on a port |
| `exec` | Run a command inside the container; exit 0 = healthy |

---

### Scheduling fields (pod-level, under `template.spec`)

These control **where** the pod runs, not **what** it runs.

```yaml
# Run only on nodes with this label
nodeSelector:
  disktype: ssd

# Prefer certain nodes (soft constraint)
affinity:
  nodeAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        preference:
          matchExpressions:
            - key: lab-zone
              operator: In
              values: [west]

# Allow scheduling onto tainted nodes
tolerations:
  - key: dedicated
    operator: Equal
    value: gpu
    effect: NoSchedule
```

If `nodeSelector` points to a label that no node has, the pod stays `Pending` forever with no container logs (Lab 01).

---

### Other common pod spec fields

```yaml
template:
  spec:
    restartPolicy: Always       # Always | OnFailure | Never (default: Always)
    serviceAccountName: my-sa     # identity for API access
    volumes:                      # storage attached to the pod
      - name: data
        persistentVolumeClaim:
          claimName: data-pvc
    volumeMounts:                 # mount volumes into containers (under containers:)
      - name: data
        mountPath: /data
```

`restartPolicy` is almost always `Always` for Deployments. The kubelet restarts crashed containers automatically.

---

## How the pieces connect

```
Deployment (web)
  │
  ├── spec.replicas: 2
  ├── spec.selector.matchLabels.app: web
  │
  └── creates ReplicaSet
        │
        └── creates 2 Pods, each with:
              labels: app=web
              container: nginx:1.27-alpine
                    │
                    └── Service (web) routes traffic here
                          selector: app=web
```

The label `app: web` appears in three places and must be consistent:

1. `spec.selector.matchLabels` — Deployment ownership
2. `template.metadata.labels` — stamped on every Pod
3. Service `spec.selector` — traffic routing (separate manifest)

---

## Minimal vs production-shaped

**Minimal** (enough to run):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello
spec:
  replicas: 1
  selector:
    matchLabels:
      app: hello
  template:
    metadata:
      labels:
        app: hello
    spec:
      containers:
        - name: nginx
          image: nginx:1.27-alpine
```

**Production-shaped** (what you should aim for):

- `resources` requests and limits
- `readinessProbe` and `livenessProbe`
- `strategy` with explicit surge/unavailable settings
- Labels on Deployment and Pod template
- Pinned image tag (not `latest`)
- ConfigMaps/Secrets for configuration, not hardcoded values

The baseline Deployment in `baseline/deployment.yaml` is the production-shaped reference in this repo.

---

## Quick reference — required fields

| Section | Required fields |
|---------|----------------|
| Top level | `apiVersion`, `kind`, `metadata.name` |
| `spec` | `selector`, `template` |
| `spec.template` | `metadata.labels` (must match selector), `spec.containers` |
| `containers[]` | `name`, `image` |

Everything else is optional but often necessary in real clusters.

---

## Common mistakes

| Mistake | Symptom | Where to look |
|---------|---------|---------------|
| Selector ≠ template labels | Rejected at `kubectl apply` | Compare `spec.selector` and `template.metadata.labels` |
| `nodeSelector` on missing label | `Pending`, no logs | `kubectl describe pod` → Events |
| Requests too large | `Pending` | `kubectl describe pod` → insufficient resources |
| Bad image tag | `ImagePullBackOff` | `kubectl describe pod` → Events |
| Wrong probe path | `CrashLoopBackOff`, logs look fine | `kubectl describe pod` → probe failed |
| ConfigMap key typo | `CrashLoopBackOff` | `kubectl logs`, compare env key to ConfigMap |
| Service selector mismatch | Pods running, no traffic | `kubectl get endpoints` |

---

## Apply and inspect

```bash
# Apply
kubectl apply -f baseline/deployment.yaml

# See desired vs actual
kubectl get deployment web -n k8s-lab
kubectl get pods -n k8s-lab -l app=web

# Read what the controller is doing
kubectl describe deployment web -n k8s-lab
kubectl rollout status deployment/web -n k8s-lab

# Change desired state
kubectl scale deployment web -n k8s-lab --replicas=3
kubectl set image deployment/web nginx=nginx:1.28-alpine -n k8s-lab
kubectl rollout undo deployment/web -n k8s-lab
```

---

## Next steps in this repo

- Compare this guide against `baseline/deployment.yaml` line by line
- Break scheduling with `labs/01-node-selector-trap/`
- Break probes with `labs/07-probes-failing/`
- Practice rollouts with `labs/09-rolling-update-rollback/`
- Use `debug-cheatsheet.md` when something goes wrong
