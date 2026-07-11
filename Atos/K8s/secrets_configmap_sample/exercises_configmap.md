# Kubernetes ConfigMaps — 10 Hands-On Exercises

Practice lab for learning how to create, inspect, use, update, and remove ConfigMaps in Kubernetes.

**Prerequisites**

- A running cluster (`kubectl cluster-info` succeeds)
- `kubectl` configured for your current context
- Optional: `minikube`, `kind`, or Docker Desktop Kubernetes

**Tip:** Run all exercises in a dedicated namespace so cleanup is easy:

```bash
kubectl create namespace configmap-lab
kubectl config set-context --current --namespace=configmap-lab
```

---

## Exercise 1 — Start: Create a ConfigMap from literals

**Goal:** Create your first ConfigMap and confirm it exists.

**Task:**

1. Create a generic ConfigMap named `app-settings` with two keys: `log_level=debug` and `max_connections=100`
2. List all ConfigMaps in the namespace
3. Describe the ConfigMap and confirm key names and values are visible in plain text

<details>
<summary>Solution</summary>

```bash
kubectl create configmap app-settings \
  --from-literal=log_level=debug \
  --from-literal=max_connections=100
```

Expected output:

```
configmap/app-settings created
```

Verify:

```bash
kubectl get configmaps
kubectl describe configmap app-settings
```

Expected `get configmaps` output (names and AGE vary slightly by cluster):

```
NAME           DATA   AGE
app-settings   2      5s
```

Expected `describe` excerpt — keys and values shown in plain text:

```
Name:         app-settings
Data
====
log_level:
----
debug
max_connections:
----
100
```

</details>

---

## Exercise 2 — Read: Inspect ConfigMap values

**Goal:** View the actual values stored in a ConfigMap.

**Task:**

Using the `app-settings` ConfigMap from Exercise 1:

1. Print the full ConfigMap as YAML and observe that values under `data` are plain text (not base64)
2. Print only the `log_level` value using `jsonpath`
3. Print all key/value pairs in one command

<details>
<summary>Solution</summary>

Show YAML:

```bash
kubectl get configmap app-settings -o yaml
```

Expected excerpt:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-settings
data:
  log_level: debug
  max_connections: "100"
```

Print a single key:

```bash
kubectl get configmap app-settings -o jsonpath='{.data.log_level}' && echo
```

Expected output:

```
debug
```

Print all keys (requires `jq`):

```bash
kubectl get configmap app-settings -o json | jq -r '.data | to_entries[] | "\(.key)=\(.value)"'
```

Expected output:

```
log_level=debug
max_connections=100
```

Alternative without `jq`:

```bash
kubectl get configmap app-settings -o go-template='{{range $k,$v := .data}}{{$k}}: {{$v}}{{"\n"}}{{end}}'
```

Expected output:

```
log_level: debug
max_connections: 100
```

**Note:** Unlike Secrets, ConfigMap values in the API are stored as plain text. Do not put passwords or tokens in ConfigMaps.

</details>

---

## Exercise 3 — Create a ConfigMap from files

**Goal:** Build a ConfigMap from files on disk (typical for `.properties`, `.conf`, or JSON config files).

**Task:**

1. Create two files: `/tmp/k8s-configmap-lab/application.properties` containing `server.port=8080` and `app.name=demo`, and `/tmp/k8s-configmap-lab/nginx.conf` containing a minimal nginx server block
2. Create a ConfigMap named `app-config` from those files
3. Confirm the file names became ConfigMap keys and read back the `application.properties` value

<details>
<summary>Solution</summary>

Create files:

```bash
mkdir -p /tmp/k8s-configmap-lab
cat > /tmp/k8s-configmap-lab/application.properties <<'EOF'
server.port=8080
app.name=demo
EOF

cat > /tmp/k8s-configmap-lab/nginx.conf <<'EOF'
server {
    listen 80;
    server_name localhost;
    location / {
        return 200 'OK';
    }
}
EOF
```

Create ConfigMap:

```bash
kubectl create configmap app-config \
  --from-file=application.properties=/tmp/k8s-configmap-lab/application.properties \
  --from-file=nginx.conf=/tmp/k8s-configmap-lab/nginx.conf
```

Expected output:

```
configmap/app-config created
```

Verify:

```bash
kubectl describe configmap app-config
kubectl get configmap app-config -o jsonpath='{.data.application\.properties}' && echo
```

Expected `describe` excerpt:

```
Data
====
application.properties:
----
server.port=8080
app.name=demo

nginx.conf:
----
server {
    listen 80;
    ...
}
```

Expected readback:

```
server.port=8080
app.name=demo
```

</details>

---

## Exercise 4 — Create a ConfigMap from a YAML manifest

**Goal:** Declare a ConfigMap in a manifest (common in GitOps and production workflows).

**Task:**

1. Write a manifest for a ConfigMap named `app-settings-yaml` with `environment=staging` and `feature_flags=metrics,tracing`
2. Apply the manifest
3. Fetch the ConfigMap as YAML and confirm values are stored under `data` as plain text

<details>
<summary>Solution</summary>

Create `app-settings.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-settings-yaml
data:
  environment: staging
  feature_flags: metrics,tracing
```

Apply and inspect:

```bash
kubectl apply -f app-settings.yaml
kubectl get configmap app-settings-yaml -o yaml
```

Expected apply output:

```
configmap/app-settings-yaml created
```

Expected stored ConfigMap:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-settings-yaml
data:
  environment: staging
  feature_flags: metrics,tracing
```

Verify a value:

```bash
kubectl get configmap app-settings-yaml -o jsonpath='{.data.environment}' && echo
```

Expected output:

```
staging
```

</details>

---

## Exercise 5 — Create a ConfigMap from an env file

**Goal:** Bulk-load key/value pairs from a `.env`-style file (common when migrating from local development).

**Task:**

1. Create `/tmp/k8s-configmap-lab/app.env` with three lines: `DATABASE_HOST=db.example.com`, `DATABASE_PORT=5432`, and `CACHE_TTL=300`
2. Create a ConfigMap named `env-file-config` from that file
3. List the keys and confirm all three entries were imported

<details>
<summary>Solution</summary>

Create the env file:

```bash
cat > /tmp/k8s-configmap-lab/app.env <<'EOF'
DATABASE_HOST=db.example.com
DATABASE_PORT=5432
CACHE_TTL=300
EOF
```

Create ConfigMap:

```bash
kubectl create configmap env-file-config --from-env-file=/tmp/k8s-configmap-lab/app.env
```

Expected output:

```
configmap/env-file-config created
```

Verify:

```bash
kubectl get configmap env-file-config -o yaml
kubectl get configmap env-file-config -o json | jq -r '.data | keys[]'
```

Expected keys:

```
CACHE_TTL
DATABASE_HOST
DATABASE_PORT
```

Expected data excerpt:

```yaml
data:
  CACHE_TTL: "300"
  DATABASE_HOST: db.example.com
  DATABASE_PORT: "5432"
```

</details>

---

## Exercise 6 — Use a ConfigMap as environment variables in a Pod

**Goal:** Inject ConfigMap values into a running container.

**Task:**

1. Create a Pod named `configmap-env-demo` using `busybox:1.36`
2. Map `app-settings.log_level` to env var `LOG_LEVEL` and `app-settings.max_connections` to `MAX_CONN`
3. On startup, print both env vars, then sleep
4. Confirm the Pod logs show the correct values

<details>
<summary>Solution</summary>

Create `configmap-env-pod.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: configmap-env-demo
spec:
  restartPolicy: Never
  containers:
    - name: app
      image: busybox:1.36
      command: ["sh", "-c", "echo LOG_LEVEL=$LOG_LEVEL MAX_CONN=$MAX_CONN && sleep 3600"]
      env:
        - name: LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: app-settings
              key: log_level
        - name: MAX_CONN
          valueFrom:
            configMapKeyRef:
              name: app-settings
              key: max_connections
```

Run and verify:

```bash
kubectl apply -f configmap-env-pod.yaml
kubectl wait --for=condition=Ready pod/configmap-env-demo --timeout=60s
kubectl logs configmap-env-demo
```

Expected log output:

```
LOG_LEVEL=debug MAX_CONN=100
```

Optional — inspect env inside the container:

```bash
kubectl exec configmap-env-demo -- env | grep -E '^(LOG_LEVEL|MAX_CONN)='
```

Expected output:

```
LOG_LEVEL=debug
MAX_CONN=100
```

</details>

---

## Exercise 7 — Mount a ConfigMap as a volume

**Goal:** Expose ConfigMap data as files inside a Pod (common for nginx, Spring Boot, and app config bundles).

**Task:**

1. Create a Pod named `configmap-volume-demo` that mounts `app-config` at `/etc/config` (read-only)
2. On startup, list the mount directory and print the contents of `application.properties`
3. Confirm each ConfigMap key appears as a separate file

<details>
<summary>Solution</summary>

Create `configmap-volume-pod.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: configmap-volume-demo
spec:
  restartPolicy: Never
  containers:
    - name: app
      image: busybox:1.36
      command: ["sh", "-c", "ls -l /etc/config && cat /etc/config/application.properties && sleep 3600"]
      volumeMounts:
        - name: config
          mountPath: /etc/config
          readOnly: true
  volumes:
    - name: config
      configMap:
        name: app-config
```

Apply and inspect:

```bash
kubectl apply -f configmap-volume-pod.yaml
kubectl wait --for=condition=Ready pod/configmap-volume-demo --timeout=60s
kubectl logs configmap-volume-demo
kubectl exec configmap-volume-demo -- ls -la /etc/config
```

Expected log output (file sizes may vary):

```
total 0
lrwxrwxrwx    1 root     root            28 Jul 11 08:00 application.properties -> ..data/application.properties
lrwxrwxrwx    1 root     root            17 Jul 11 08:00 nginx.conf -> ..data/nginx.conf
server.port=8080
app.name=demo
```

Expected `ls -la` output:

```
total 4
drwxrwxrwt    3 root     root           120 Jul 11 08:00 .
drwxr-xr-x    1 root     root          4096 Jul 11 08:00 ..
drwxr-xr-x    2 root     root            80 Jul 11 08:00 ..2026_07_11_08_00_00.1234567890
lrwxrwxrwx    1 root     root            32 Jul 11 08:00 ..data -> ..2026_07_11_08_00_00.1234567890
lrwxrwxrwx    1 root     root            28 Jul 11 08:00 application.properties -> ..data/application.properties
lrwxrwxrwx    1 root     root            17 Jul 11 08:00 nginx.conf -> ..data/nginx.conf
```

</details>

---

## Exercise 8 — Update a ConfigMap and observe Pod behavior

**Goal:** Change ConfigMap values and observe how Pods behave.

**Task:**

1. Update the `log_level` key in `app-settings` to `info` using `kubectl patch`
2. Confirm the ConfigMap holds the new value
3. Check whether running Pods (`configmap-env-demo`, `configmap-volume-demo`) picked up the change without a restart
4. Restart the env Pod and confirm it now uses the new value; check whether the volume mount updated on disk

<details>
<summary>Solution</summary>

Patch the log level:

```bash
kubectl patch configmap app-settings -p \
  '{"data":{"log_level":"info"}}'
```

Expected output:

```
configmap/app-settings patched
```

Verify new value in the ConfigMap:

```bash
kubectl get configmap app-settings -o jsonpath='{.data.log_level}' && echo
```

Expected output:

```
info
```

Check running Pod — env var is **stale** (still old value from creation time):

```bash
kubectl exec configmap-env-demo -- printenv LOG_LEVEL
```

Expected output (before restart):

```
debug
```

Volume mounts are synced by the kubelet periodically (default sync interval is ~1 minute). After a short wait, the file on disk may update:

```bash
kubectl exec configmap-volume-demo -- cat /etc/config/../.. 2>/dev/null || true
sleep 65
kubectl exec configmap-volume-demo -- cat /etc/config/application.properties
```

Restart the env Pod to pick up the new value reliably:

```bash
kubectl delete pod configmap-env-demo
kubectl apply -f configmap-env-pod.yaml
kubectl wait --for=condition=Ready pod/configmap-env-demo --timeout=60s
kubectl logs configmap-env-demo
```

Expected log output after restart:

```
LOG_LEVEL=info MAX_CONN=100
```

**Alternative — replace the whole ConfigMap:**

```bash
kubectl delete configmap app-settings
kubectl create configmap app-settings \
  --from-literal=log_level=warn \
  --from-literal=max_connections=200
```

</details>

---

## Exercise 9 — List, filter, and export ConfigMaps

**Goal:** Practice day-to-day inspection tasks.

**Task:**

1. List all ConfigMaps in the namespace
2. Label `app-settings` with `app=demo` and `tier=frontend`, then find it by label
3. Export `app-settings` to a YAML backup file
4. Use `kubectl explain` to read the ConfigMap API schema

<details>
<summary>Solution</summary>

List all ConfigMaps:

```bash
kubectl get configmaps
```

Expected output (AGE will differ):

```
NAME                DATA   AGE
app-config          2      10m
app-settings        2      15m
app-settings-yaml   2      12m
env-file-config     3      8m
```

Label and find:

```bash
kubectl label configmap app-settings app=demo tier=frontend
kubectl get configmaps -l app=demo
```

Expected output:

```
NAME           DATA   AGE
app-settings   2      15m
```

Export backup:

```bash
kubectl get configmap app-settings -o yaml > app-settings-backup.yaml
head -20 app-settings-backup.yaml
```

Expected excerpt — values remain plain text in the file:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  labels:
    app: demo
    tier: frontend
  name: app-settings
data:
  log_level: info
  max_connections: "100"
```

Read the API schema:

```bash
kubectl explain configmap
kubectl explain configmap.data
```

Expected excerpt:

```
KIND:     ConfigMap
VERSION:  v1
DESCRIPTION:
     ConfigMap holds configuration data for pods to consume.
FIELDS:
   data	<map[string]string>
     Data contains the configuration data.
```

</details>

---

## Exercise 10 — Stop: Delete ConfigMaps and clean up the lab

**Goal:** Remove ConfigMaps safely and tear down practice resources.

**Task:**

1. Delete all ConfigMaps created during the lab
2. Delete the demo Pods
3. Delete the `configmap-lab` namespace
4. Confirm nothing remains

<details>
<summary>Solution</summary>

Delete individual ConfigMaps:

```bash
kubectl delete configmap app-settings app-config app-settings-yaml env-file-config
```

Expected output:

```
configmap "app-settings" deleted
configmap "app-config" deleted
configmap "app-settings-yaml" deleted
configmap "env-file-config" deleted
```

Delete demo Pods:

```bash
kubectl delete pod configmap-env-demo configmap-volume-demo --ignore-not-found
```

Delete the namespace (fastest full cleanup — removes everything in it):

```bash
kubectl delete namespace configmap-lab
kubectl config set-context --current --namespace=default
```

Expected output:

```
namespace "configmap-lab" deleted
Context "docker-desktop" modified.
```

Verify nothing remains:

```bash
kubectl get configmaps -n configmap-lab 2>&1
kubectl get pods -A | grep configmap || echo "no configmap demo pods"
```

Expected output:

```
Error from server (NotFound): namespaces "configmap-lab" not found
no configmap demo pods
```

Clean up local temp files:

```bash
rm -rf /tmp/k8s-configmap-lab
rm -f app-settings.yaml configmap-env-pod.yaml configmap-volume-pod.yaml app-settings-backup.yaml
```

</details>

---

## Bonus challenges — Solutions

<details>
<summary>1. Immutable ConfigMap</summary>

Create `app-settings-immutable.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-settings
type: Opaque
immutable: true
data:
  log_level: debug
  max_connections: "100"
```

Apply (recreate namespace first if deleted):

```bash
kubectl create namespace configmap-lab
kubectl config set-context --current --namespace=configmap-lab
kubectl apply -f app-settings-immutable.yaml
```

Try to patch:

```bash
kubectl patch configmap app-settings -p '{"data":{"log_level":"info"}}'
```

Expected error:

```
Error from server (Forbidden): ... ConfigMap "app-settings" is invalid: field is immutable
```

Fix: delete and recreate the ConfigMap — immutable ConfigMaps cannot be updated in place.

</details>

<details>
<summary>2. Missing key</summary>

Create a Pod referencing a key that does not exist:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: configmap-bad-key
spec:
  restartPolicy: Never
  containers:
    - name: app
      image: busybox:1.36
      env:
        - name: MISSING
          valueFrom:
            configMapKeyRef:
              name: app-settings
              key: nonexistent-key
```

Apply and inspect:

```bash
kubectl apply -f configmap-bad-key.yaml
kubectl describe pod configmap-bad-key
```

Expected event:

```
Warning  Failed  ...  Error: couldn't find key nonexistent-key in ConfigMap configmap-lab/app-settings
```

Pod stays in `CreateContainerConfigError` state until the key exists or the Pod is fixed.

</details>

<details>
<summary>3. Mount a single key to a specific file path</summary>

Use `items` to map one key to a custom filename (common when an app expects a fixed path like `/etc/app/config.json`):

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: configmap-subpath-demo
spec:
  restartPolicy: Never
  containers:
    - name: app
      image: busybox:1.36
      command: ["sh", "-c", "cat /etc/app/config.json && sleep 3600"]
      volumeMounts:
        - name: config
          mountPath: /etc/app/config.json
          subPath: application.properties
          readOnly: true
  volumes:
    - name: config
      configMap:
        name: app-config
        items:
          - key: application.properties
            path: application.properties
```

Apply and verify:

```bash
kubectl apply -f configmap-subpath-pod.yaml
kubectl wait --for=condition=Ready pod/configmap-subpath-demo --timeout=60s
kubectl logs configmap-subpath-demo
```

Expected output:

```
server.port=8080
app.name=demo
```

</details>

<details>
<summary>4. Inject all keys as env vars with envFrom</summary>

Load every key from a ConfigMap as environment variables in one block:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: configmap-envfrom-demo
spec:
  restartPolicy: Never
  containers:
    - name: app
      image: busybox:1.36
      command: ["sh", "-c", "env | sort && sleep 3600"]
      envFrom:
        - configMapRef:
            name: env-file-config
```

Apply and verify:

```bash
kubectl apply -f configmap-envfrom-pod.yaml
kubectl wait --for=condition=Ready pod/configmap-envfrom-demo --timeout=60s
kubectl exec configmap-envfrom-demo -- env | grep -E '^(DATABASE_|CACHE_)' | sort
```

Expected output:

```
CACHE_TTL=300
DATABASE_HOST=db.example.com
DATABASE_PORT=5432
```

</details>

<details>
<summary>5. Compare with Secret</summary>

```bash
kubectl create configmap app-greeting --from-literal=greeting=hello
kubectl create secret generic app-greeting-secret --from-literal=greeting=hello

kubectl get configmap app-greeting -o yaml
kubectl get secret app-greeting-secret -o yaml
```

| Aspect | ConfigMap | Secret |
|--------|-----------|--------|
| Purpose | Non-sensitive config | Credentials, tokens, keys |
| Storage in API | Plain text under `data` | Base64-encoded under `data` |
| Size limit | 1 MiB | 1 MiB |
| Volume mount | Plain file contents | Plain file contents (decoded at mount) |
| Encryption at rest | Optional (depends on cluster) | Optional (depends on cluster) |
| Best practice | OK for config files | Use external secret manager in production |

Both appear as files/env vars to the Pod — the difference is intent and API handling, not runtime isolation. Never store passwords in ConfigMaps.

</details>

---

## Quick reference

| Task | Command |
|------|---------|
| Create from literals | `kubectl create configmap NAME --from-literal=key=value` |
| Create from file | `kubectl create configmap NAME --from-file=path` |
| Create from env file | `kubectl create configmap NAME --from-env-file=path` |
| List ConfigMaps | `kubectl get configmaps` |
| Describe (shows values) | `kubectl describe configmap NAME` |
| Show YAML | `kubectl get configmap NAME -o yaml` |
| Read one value | `kubectl get configmap NAME -o jsonpath='{.data.KEY}'` |
| Apply manifest | `kubectl apply -f file.yaml` |
| Update value | `kubectl patch configmap NAME -p '{"data":{"key":"value"}}'` |
| Delete ConfigMap | `kubectl delete configmap NAME` |
| Full cleanup | `kubectl delete namespace configmap-lab` |
