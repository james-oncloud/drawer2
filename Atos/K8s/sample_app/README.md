# sample-app Helm Chart

A minimal Helm chart that deploys **nginx** into Kubernetes. Use it to learn how a chart is structured and how to install / uninstall a release.

No image build is required — it uses the public `nginx:alpine` image.

---

## Chart layout

```
sample_app/
├── Chart.yaml              # Chart metadata (name, version, description)
├── values.yaml             # Default configuration you can override
├── .helmignore             # Files excluded when packaging the chart
├── README.md               # This file
└── templates/
    ├── _helpers.tpl        # Shared naming / label helpers (not a K8s object)
    ├── deployment.yaml     # Creates Pods that run nginx
    ├── service.yaml        # Stable network endpoint in front of the Pods
    └── NOTES.txt           # Printed after a successful install
```

### What each file does

| File | Role |
|------|------|
| **Chart.yaml** | Identifies the chart (`name`, `version`) and the app version it packages (`appVersion`). |
| **values.yaml** | Default knobs: replica count, image, service type/port. Helm injects these into templates as `.Values`. |
| **templates/** | Go templates that render into real Kubernetes YAML. `{{ .Values... }}` is replaced at install time. |
| **_helpers.tpl** | Named snippets (e.g. full resource name, labels) reused by Deployment and Service so they stay consistent. |
| **deployment.yaml** | Desired number of nginx Pods and how to create them. |
| **service.yaml** | ClusterIP Service that load-balances traffic to those Pods. |
| **NOTES.txt** | Short usage tips shown by Helm after install. |

### How Helm wires it together

1. You run `helm install` / `helm upgrade --install`.
2. Helm merges `values.yaml` with any `--set` / `-f` overrides.
3. Templates are rendered into Kubernetes manifests.
4. Those manifests are applied to the cluster as one **release** (named by you).

---

## Prerequisites

- A working Kubernetes cluster (`kubectl get nodes` succeeds)
- [Helm 3](https://helm.sh/docs/intro/install/) installed (`helm version`)

---

## Deploy

From this directory (`Atos/K8s/sample_app`):

### 1. Install the chart

```bash
helm upgrade --install sample-app .
```

- `sample-app` — release name (what you later uninstall)
- `.` — path to this chart

Install into a specific namespace:

```bash
kubectl create namespace demo --dry-run=client -o yaml | kubectl apply -f -
helm upgrade --install sample-app . -n demo
```

### 2. Override values (optional)

Change replicas and service type on the command line:

```bash
helm upgrade --install sample-app . \
  --set replicaCount=3 \
  --set service.type=LoadBalancer
```

Or with a custom values file:

```bash
helm upgrade --install sample-app . -f my-values.yaml
```

### 3. Verify

```bash
helm list
kubectl get deploy,pods,svc -l app.kubernetes.io/instance=sample-app
```

### 4. Access the app

With the default `ClusterIP` service, use port-forward:

```bash
kubectl port-forward svc/sample-app 8080:80
```

Open [http://localhost:8080](http://localhost:8080) — you should see the nginx welcome page.

---

## Undeploy

Remove the release and all resources it created:

```bash
helm uninstall sample-app
```

If you installed into a namespace:

```bash
helm uninstall sample-app -n demo
```

Confirm everything is gone:

```bash
helm list
kubectl get deploy,pods,svc -l app.kubernetes.io/instance=sample-app
```

---

## Generate YAML with values

Render the chart to YAML with values applied (no install):

```bash
# from the chart directory
helm template sample-app .

# from the packaged chart
helm template sample-app ./sample-app-0.1.0.tgz
```

**With overrides:**

```bash
helm template sample-app . --set replicaCount=3

helm template sample-app . -f my-values.yaml
```

**Write to files:**

```bash
helm template sample-app . --output-dir ./rendered
```

That creates `./rendered/sample-app/templates/*.yaml` with values filled in.

**Preview against the cluster (still no apply):**

```bash
helm install sample-app . --dry-run --debug
```

---

## Package the chart (optional)

Create a versioned `.tgz` archive (uses `version` from `Chart.yaml`):

```bash
helm package .
# → sample-app-0.1.0.tgz
```

Install from the package:

```bash
helm upgrade --install sample-app ./sample-app-0.1.0.tgz
```

---

## Useful commands

| Command | Purpose |
|---------|---------|
| `helm list` | Show installed releases |
| `helm status sample-app` | Status of this release |
| `helm get values sample-app` | Values currently applied |
| `helm get manifest sample-app` | Exact YAML that was applied |
| `helm history sample-app` | Upgrade / rollback history |
| `helm uninstall sample-app` | Tear down the release |

---

## Default values reference

```yaml
replicaCount: 2

image:
  repository: nginx
  tag: alpine
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

resources: {}
```

Edit `values.yaml` or override at install time as shown above.
