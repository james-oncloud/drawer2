# Kubernetes Secrets — 10 Hands-On Exercises

Practice lab for learning how to create, inspect, use, update, and remove Secrets in Kubernetes.

**Prerequisites**

- A running cluster (`kubectl cluster-info` succeeds)
- `kubectl` configured for your current context
- Optional: `minikube`, `kind`, or Docker Desktop Kubernetes

**Tip:** Run all exercises in a dedicated namespace so cleanup is easy:

```bash
kubectl create namespace secrets-lab
kubectl config set-context --current --namespace=secrets-lab
```

---

## Exercise 1 — Start: Create a Secret from literals

**Goal:** Create your first Secret and confirm it exists.

**Task:**

1. Create a generic Secret named `db-credentials` with two keys: `username=admin` and `password=s3cr3t!`
2. List all Secrets in the namespace
3. Describe the Secret and confirm key names are visible but values are not shown in plain text

<details>
<summary>Solution</summary>

```bash
kubectl create secret generic db-credentials \
  --from-literal=username=admin \
  --from-literal=password='s3cr3t!'
```

Expected output:

```
secret/db-credentials created
```

Verify:

```bash
kubectl get secrets
kubectl describe secret db-credentials
```

Expected `get secrets` output (names and types vary slightly by cluster):

```
NAME             TYPE     DATA   AGE
db-credentials   Opaque   2      5s
```

Expected `describe` excerpt — keys listed, values hidden:

```
Name:         db-credentials
Type:         Opaque

Data
====
password:  8 bytes
username:  5 bytes
```

</details>

---

## Exercise 2 — Show values: Decode and inspect Secret data

**Goal:** View the actual values stored in a Secret.

**Task:**

Using the `db-credentials` Secret from Exercise 1:

1. Print the full Secret as YAML and observe that values under `data` are base64-encoded
2. Decode and print only the `password` value
3. Decode and print all key/value pairs in one command

<details>
<summary>Solution</summary>

Show encoded YAML:

```bash
kubectl get secret db-credentials -o yaml
```

Expected excerpt (values will differ slightly — base64 of `admin` is `YWRtaW4=`, base64 of `s3cr3t!` is `czNjcrN0IQ==`):

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
data:
  password: czNjcrN0IQ==
  username: YWRtaW4=
```

Decode a single key:

```bash
kubectl get secret db-credentials -o jsonpath='{.data.password}' | base64 --decode && echo
```

Expected output:

```
s3cr3t!
```

Decode all keys (requires `jq`):

```bash
kubectl get secret db-credentials -o json | jq -r '.data | to_entries[] | "\(.key)=\(.value | @base64d)"'
```

Expected output:

```
password=s3cr3t!
username=admin
```

Alternative without `jq`:

```bash
kubectl get secret db-credentials -o go-template='{{range $k,$v := .data}}{{$k}}: {{$v | base64decode}}{{"\n"}}{{end}}'
```

Expected output:

```
password: s3cr3t!
username: admin
```

</details>

---

## Exercise 3 — Create a Secret from files

**Goal:** Build a Secret from files on disk (typical for TLS certs, `.env` files, or key pairs).

**Task:**

1. Create two files: `/tmp/k8s-secrets-lab/api-key` containing `my-api-key-12345`, and `/tmp/k8s-secrets-lab/tls.crt` containing a fake PEM certificate
2. Create a generic Secret named `app-config` from those files
3. Confirm the file names became Secret keys and decode `api-key` to verify its value

<details>
<summary>Solution</summary>

Create files:

```bash
mkdir -p /tmp/k8s-secrets-lab
echo -n 'my-api-key-12345' > /tmp/k8s-secrets-lab/api-key
echo -n '-----BEGIN FAKE CERT-----
MIIB...
-----END FAKE CERT-----' > /tmp/k8s-secrets-lab/tls.crt
```

Create Secret:

```bash
kubectl create secret generic app-config \
  --from-file=api-key=/tmp/k8s-secrets-lab/api-key \
  --from-file=tls.crt=/tmp/k8s-secrets-lab/tls.crt
```

Expected output:

```
secret/app-config created
```

Verify:

```bash
kubectl describe secret app-config
kubectl get secret app-config -o jsonpath='{.data.api-key}' | base64 --decode && echo
```

Expected `describe` excerpt:

```
Data
====
api-key:  16 bytes
tls.crt:  58 bytes
```

Expected decoded value:

```
my-api-key-12345
```

</details>

---

## Exercise 4 — Create a Secret from a YAML manifest

**Goal:** Declare a Secret in a manifest (common in GitOps and production workflows).

**Task:**

1. Write a manifest for a Secret named `db-secret-yaml` with `username=appuser` and `password=changeme` using `stringData`
2. Apply the manifest
3. Fetch the Secret as YAML and confirm Kubernetes stored the values under `data` as base64

<details>
<summary>Solution</summary>

Create `db-secret.yaml`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret-yaml
type: Opaque
stringData:
  username: appuser
  password: changeme
```

Apply and inspect:

```bash
kubectl apply -f db-secret.yaml
kubectl get secret db-secret-yaml -o yaml
```

Expected apply output:

```
secret/db-secret-yaml created
```

Expected stored Secret (note: `stringData` is gone; values moved to `data`):

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret-yaml
type: Opaque
data:
  password: Y2hhbmdlbWU=
  username: YXBwdXNlcg==
```

Verify decoding:

```bash
kubectl get secret db-secret-yaml -o jsonpath='{.data.username}' | base64 --decode && echo
```

Expected output:

```
appuser
```

**Note:** `stringData` is plain text in the manifest; Kubernetes encodes it to `data` on save. Prefer Sealed Secrets, External Secrets Operator, or a vault in real environments — never commit real credentials to git.

</details>

---

## Exercise 5 — Use a Secret as environment variables in a Pod

**Goal:** Inject Secret values into a running container.

**Task:**

1. Create a Pod named `secret-env-demo` using `busybox:1.36`
2. Map `db-credentials.username` to env var `DB_USER` and `db-credentials.password` to `DB_PASS`
3. On startup, print both env vars, then sleep
4. Confirm the Pod logs show the correct values

<details>
<summary>Solution</summary>

Create `secret-env-pod.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret-env-demo
spec:
  restartPolicy: Never
  containers:
    - name: app
      image: busybox:1.36
      command: ["sh", "-c", "echo USER=$DB_USER PASS=$DB_PASS && sleep 3600"]
      env:
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: username
        - name: DB_PASS
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
```

Run and verify:

```bash
kubectl apply -f secret-env-pod.yaml
kubectl wait --for=condition=Ready pod/secret-env-demo --timeout=60s
kubectl logs secret-env-demo
```

Expected log output:

```
USER=admin PASS=s3cr3t!
```

Optional — inspect env inside the container:

```bash
kubectl exec secret-env-demo -- env | grep -E '^DB_'
```

Expected output:

```
DB_USER=admin
DB_PASS=s3cr3t!
```

</details>

---

## Exercise 6 — Mount a Secret as a volume

**Goal:** Expose Secret data as files inside a Pod (common for TLS and config bundles).

**Task:**

1. Create a Pod named `secret-volume-demo` that mounts `db-credentials` at `/etc/secrets` (read-only)
2. On startup, list the mount directory and print the contents of the `password` file
3. Confirm each Secret key appears as a separate file

<details>
<summary>Solution</summary>

Create `secret-volume-pod.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret-volume-demo
spec:
  restartPolicy: Never
  containers:
    - name: app
      image: busybox:1.36
      command: ["sh", "-c", "ls -l /etc/secrets && cat /etc/secrets/password && sleep 3600"]
      volumeMounts:
        - name: creds
          mountPath: /etc/secrets
          readOnly: true
  volumes:
    - name: creds
      secret:
        secretName: db-credentials
```

Apply and inspect:

```bash
kubectl apply -f secret-volume-pod.yaml
kubectl wait --for=condition=Ready pod/secret-volume-demo --timeout=60s
kubectl logs secret-volume-demo
kubectl exec secret-volume-demo -- ls -la /etc/secrets
```

Expected log output (file sizes may vary):

```
total 0
lrwxrwxrwx    1 root     root            15 Jul 10 20:00 password -> ..data/password
lrwxrwxrwx    1 root     root            15 Jul 10 20:00 username -> ..data/username
s3cr3t!
```

Expected `ls -la` output:

```
total 4
drwxrwxrwt    3 root     root           120 Jul 10 20:00 .
drwxr-xr-x    1 root     root          4096 Jul 10 20:00 ..
drwxr-xr-x    2 root     root            80 Jul 10 20:00 ..2026_07_10_20_00_00.1234567890
lrwxrwxrwx    1 root     root            32 Jul 10 20:00 ..data -> ..2026_07_10_20_00_00.1234567890
lrwxrwxrwx    1 root     root            15 Jul 10 20:00 password -> ..data/password
lrwxrwxrwx    1 root     root            15 Jul 10 20:00 username -> ..data/username
```

</details>

---

## Exercise 7 — Create a docker-registry Secret

**Goal:** Store credentials for pulling private container images.

**Task:**

1. Create a docker-registry Secret named `regcred` for server `registry.example.com`, user `myuser`, password `myregistrypass`, email `myuser@example.com`
2. Inspect the Secret and identify its `type` and the key that holds credentials
3. Write the `imagePullSecrets` snippet needed to use it in a Pod spec

<details>
<summary>Solution</summary>

Create the Secret:

```bash
kubectl create secret docker-registry regcred \
  --docker-server=registry.example.com \
  --docker-username=myuser \
  --docker-password='myregistrypass' \
  --docker-email=myuser@example.com
```

Expected output:

```
secret/regcred created
```

Inspect:

```bash
kubectl get secret regcred -o yaml
```

Expected excerpt:

```yaml
type: kubernetes.io/dockerconfigjson
data:
  .dockerconfigjson: eyJhdXRocyI6eyJyZWdpc3RyeS5leGFtcGxlLmNvbSI6eyJ1c2VybmFtZSI6Im15dXNlciIsInBhc3N3b3JkIjoibXlyZWdpc3R5cGFzcyIsImVtYWlsIjoibXl1c2VyQGV4YW1wbGUuY29tIiwiYXV0aCI6ImJXVnRZVzUwY21GcGNIVmliM0pwYmpBeU1RPT0ifX19
```

Decode to inspect structure (optional):

```bash
kubectl get secret regcred -o jsonpath='{.data.\.dockerconfigjson}' | base64 --decode | jq .
```

Expected decoded JSON:

```json
{
  "auths": {
    "registry.example.com": {
      "username": "myuser",
      "password": "myregistrypass",
      "email": "myuser@example.com",
      "auth": "bXl1c2VyOm15cmVnaXN0cnlwYXNz"
    }
  }
}
```

Use in a Pod spec:

```yaml
spec:
  imagePullSecrets:
    - name: regcred
  containers:
    - name: app
      image: registry.example.com/myorg/myapp:1.0.0
```

</details>

---

## Exercise 8 — Update (rotate) a Secret

**Goal:** Change Secret values and observe how Pods behave.

**Task:**

1. Update the `password` key in `db-credentials` to a new value using `kubectl patch`
2. Confirm the Secret holds the new value
3. Check whether running Pods (`secret-env-demo`, `secret-volume-demo`) picked up the change without a restart
4. Restart the Pods and confirm they now use the new password

<details>
<summary>Solution</summary>

Patch the password:

```bash
kubectl patch secret db-credentials -p \
  '{"stringData":{"password":"patched-password"}}'
```

Expected output:

```
secret/db-credentials patched
```

Verify new value in the Secret:

```bash
kubectl get secret db-credentials -o jsonpath='{.data.password}' | base64 --decode && echo
```

Expected output:

```
patched-password
```

Check running Pod — env var is **stale** (still old value from creation time):

```bash
kubectl exec secret-env-demo -- printenv DB_PASS
```

Expected output (before restart):

```
s3cr3t!
```

Check volume mount — file may update on disk (kubelet syncs periodically), but env vars never update in-place. Restart Pods to pick up changes reliably:

```bash
kubectl delete pod secret-env-demo secret-volume-demo
kubectl apply -f secret-env-pod.yaml
kubectl apply -f secret-volume-pod.yaml
kubectl wait --for=condition=Ready pod/secret-env-demo --timeout=60s
kubectl logs secret-env-demo
```

Expected log output after restart:

```
USER=admin PASS=patched-password
```

**Alternative — replace the whole Secret:**

```bash
kubectl delete secret db-credentials
kubectl create secret generic db-credentials \
  --from-literal=username=admin \
  --from-literal=password='n3w-p@ssw0rd!'
```

</details>

---

## Exercise 9 — List, filter, and export Secrets

**Goal:** Practice day-to-day inspection tasks without decoding everything.

**Task:**

1. List all Secrets in the namespace
2. Filter to show only `Opaque` type Secrets
3. Label `db-credentials` with `app=database` and `tier=backend`, then find it by label
4. Export `db-credentials` to a YAML backup file

<details>
<summary>Solution</summary>

List all Secrets:

```bash
kubectl get secrets
```

Expected output (AGE will differ):

```
NAME             TYPE                             DATA   AGE
app-config       Opaque                           2      10m
db-credentials   Opaque                           2      15m
db-secret-yaml   Opaque                           2      12m
regcred          kubernetes.io/dockerconfigjson   1      8m
```

Filter by type:

```bash
kubectl get secrets --field-selector type=Opaque
```

Expected output — only generic Secrets, not `regcred`:

```
NAME             TYPE     DATA   AGE
app-config       Opaque   2      10m
db-credentials   Opaque   2      15m
db-secret-yaml   Opaque   2      12m
```

Label and find:

```bash
kubectl label secret db-credentials app=database tier=backend
kubectl get secrets -l app=database
```

Expected output:

```
NAME             TYPE     DATA   AGE
db-credentials   Opaque   2      15m
```

Export backup:

```bash
kubectl get secret db-credentials -o yaml > db-credentials-backup.yaml
head -20 db-credentials-backup.yaml
```

Expected excerpt — values remain base64-encoded in the file:

```yaml
apiVersion: v1
kind: Secret
metadata:
  labels:
    app: database
    tier: backend
  name: db-credentials
type: Opaque
data:
  password: cGF0Y2hlZC1wYXNzd29yZA==
  username: YWRtaW4=
```

</details>

---

## Exercise 10 — Stop: Delete Secrets and clean up the lab

**Goal:** Remove Secrets safely and tear down practice resources.

**Task:**

1. Delete all Secrets created during the lab
2. Delete the demo Pods
3. Delete the `secrets-lab` namespace
4. Confirm nothing remains

<details>
<summary>Solution</summary>

Delete individual Secrets:

```bash
kubectl delete secret db-credentials app-config db-secret-yaml regcred
```

Expected output:

```
secret "db-credentials" deleted
secret "app-config" deleted
secret "db-secret-yaml" deleted
secret "regcred" deleted
```

Delete demo Pods:

```bash
kubectl delete pod secret-env-demo secret-volume-demo --ignore-not-found
```

Delete the namespace (fastest full cleanup — removes everything in it):

```bash
kubectl delete namespace secrets-lab
kubectl config set-context --current --namespace=default
```

Expected output:

```
namespace "secrets-lab" deleted
Context "docker-desktop" modified.
```

Verify nothing remains:

```bash
kubectl get secrets -n secrets-lab 2>&1
kubectl get pods -A | grep secret || echo "no secret demo pods"
```

Expected output:

```
Error from server (NotFound): namespaces "secrets-lab" not found
no secret demo pods
```

Clean up local temp files:

```bash
rm -rf /tmp/k8s-secrets-lab
rm -f db-secret.yaml secret-env-pod.yaml secret-volume-pod.yaml db-credentials-backup.yaml
```

</details>

---

## Bonus challenges — Solutions

<details>
<summary>1. Immutable Secret</summary>

Create `db-credentials-immutable.yaml`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
immutable: true
stringData:
  username: admin
  password: cannot-change
```

Apply (recreate namespace first if deleted):

```bash
kubectl create namespace secrets-lab
kubectl config set-context --current --namespace=secrets-lab
kubectl apply -f db-credentials-immutable.yaml
```

Try to patch:

```bash
kubectl patch secret db-credentials -p '{"stringData":{"password":"new"}}'
```

Expected error:

```
Error from server (Forbidden): admission webhook ... Secret "db-credentials" is invalid: field is immutable
```

Fix: delete and recreate the Secret — immutable Secrets cannot be updated in place.

</details>

<details>
<summary>2. Missing key</summary>

Create a Pod referencing a key that does not exist:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret-bad-key
spec:
  restartPolicy: Never
  containers:
    - name: app
      image: busybox:1.36
      env:
        - name: MISSING
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: nonexistent-key
```

Apply and inspect:

```bash
kubectl apply -f secret-bad-key.yaml
kubectl describe pod secret-bad-key
```

Expected event:

```
Warning  Failed  ...  Error: couldn't find key nonexistent-key in Secret secrets-lab/db-credentials
```

Pod stays in `CreateContainerConfigError` state until the key exists or the Pod is fixed.

</details>

<details>
<summary>3. RBAC — get but not list</summary>

```yaml
# secret-reader-role.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: secret-getter
rules:
  - apiGroups: [""]
    resources: ["secrets"]
    resourceNames: ["db-credentials"]
    verbs: ["get"]
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: limited-sa
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: secret-getter-binding
subjects:
  - kind: ServiceAccount
    name: limited-sa
roleRef:
  kind: Role
  name: secret-getter
  apiGroup: rbac.authorization.k8s.io
```

Test:

```bash
kubectl apply -f secret-reader-role.yaml

# Allowed — specific Secret by name
kubectl auth can-i get secret/db-credentials --as=system:serviceaccount:secrets-lab:limited-sa
# yes

# Denied — list all Secrets
kubectl auth can-i list secrets --as=system:serviceaccount:secrets-lab:limited-sa
# no
```

</details>

<details>
<summary>4. Helm integration</summary>

Add to `templates/secret.yaml` in a Helm chart:

```yaml
{{- if .Values.secret.enabled }}
apiVersion: v1
kind: Secret
metadata:
  name: {{ include "mychart.fullname" . }}-secret
type: Opaque
stringData:
  username: {{ .Values.secret.username | quote }}
  password: {{ .Values.secret.password | quote }}
{{- end }}
```

In `values.yaml`:

```yaml
secret:
  enabled: true
  username: admin
  password: changeme
```

Install without putting secrets in git:

```bash
helm upgrade --install myapp ./mychart \
  --set secret.password='prod-secret-value'
```

</details>

<details>
<summary>5. Compare with ConfigMap</summary>

```bash
kubectl create configmap app-settings --from-literal=greeting=hello
kubectl create secret generic app-secret --from-literal=greeting=hello

kubectl get configmap app-settings -o yaml
kubectl get secret app-secret -o yaml
```

| Aspect | ConfigMap | Secret |
|--------|-----------|--------|
| Purpose | Non-sensitive config | Credentials, tokens, keys |
| Storage in API | Plain text under `data` | Base64-encoded under `data` |
| Size limit | 1 MiB | 1 MiB |
| Volume mount | Plain file contents | Plain file contents (decoded at mount) |
| Encryption at rest | Optional (depends on cluster) | Optional (depends on cluster) |
| Best practice | OK for config files | Use external secret manager in production |

Both appear as files/env vars to the Pod — the difference is intent and API handling, not runtime isolation.

</details>

---

## Quick reference

| Task | Command |
|------|---------|
| Create from literals | `kubectl create secret generic NAME --from-literal=key=value` |
| Create from file | `kubectl create secret generic NAME --from-file=path` |
| List Secrets | `kubectl get secrets` |
| Describe (no decode) | `kubectl describe secret NAME` |
| Show encoded YAML | `kubectl get secret NAME -o yaml` |
| Decode one value | `kubectl get secret NAME -o jsonpath='{.data.KEY}' \| base64 --decode` |
| Apply manifest | `kubectl apply -f file.yaml` |
| Update value | `kubectl patch secret NAME -p '{"stringData":{"key":"value"}}'` |
| Delete Secret | `kubectl delete secret NAME` |
| Full cleanup | `kubectl delete namespace secrets-lab` |
