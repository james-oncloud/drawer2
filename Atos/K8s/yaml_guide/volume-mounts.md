# How Volume Mounts Work in Kubernetes

Volumes attach storage (or storage-like content) into a Pod. The mechanism is always two pieces that you wire together **by name**:

1. **`volumes`** — declared on the **Pod** (`spec.volumes`): *what* exists
2. **`volumeMounts`** — declared on each **container**: *where* it appears inside that container

```
Pod
├── volumes:                 ← define the volume once
│     name: config
│     configMap: …
└── containers:
      └── app
            volumeMounts:    ← mount it into this container
              name: config   ← same name
              mountPath: /etc/app
```

Nothing is mounted until a container references the volume in `volumeMounts`.

---

## Mental model

```
Source (ConfigMap, PVC, emptyDir, Secret, …)
        │
        ▼
  Pod.spec.volumes[]          # name + driver/source
        │
        ▼
  container.volumeMounts[]    # name + mountPath (+ options)
        │
        ▼
  Path inside container FS    # e.g. /etc/app/app.properties
```

- Volumes are **Pod-scoped**: shared across containers in that Pod if each mounts them.
- Mounts are **container-scoped**: each container chooses its own `mountPath`.
- Different containers can mount the **same** volume at **different** paths.
- A volume listed but never mounted is unused.

---

## Minimal example

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: volume-demo
spec:
  containers:
    - name: app
      image: busybox:1.36
      command: ["sh", "-c", "ls -l /config && sleep 3600"]
      volumeMounts:
        - name: config              # must match volumes[].name
          mountPath: /config
          readOnly: true

  volumes:
    - name: config
      configMap:
        name: my-config             # existing ConfigMap in this namespace
```

Apply order: ConfigMap must exist (or set `optional: true`), then the Pod.

---

## The join key: `name`

| Field | Location | Role |
|-------|----------|------|
| `volumes[].name` | Pod spec | Identifier for the volume |
| `volumeMounts[].name` | Container | Must equal a `volumes[].name` |

Names are free-form strings (`config`, `data`, `tls`). They are **not** the ConfigMap/PVC name — those go inside the volume source.

```yaml
volumes:
  - name: data                    # ← join key
    persistentVolumeClaim:
      claimName: my-pvc           # ← actual PVC object name

# ...
volumeMounts:
  - name: data                    # ← same join key
    mountPath: /var/lib/app
```

---

## `volumeMounts` options

```yaml
volumeMounts:
  - name: data
    mountPath: /var/lib/app       # required: absolute path in container
    readOnly: false               # default false
    subPath: logs/app.log         # mount one file/dir from the volume
    # subPathExpr: "$(POD_NAME)/logs"   # subPath with env expansion
    # mountPropagation: None      # None | HostToContainer | Bidirectional
    # recursiveReadOnly: Disabled  # when readOnly + kernel support
```

| Option | Meaning |
|--------|---------|
| `mountPath` | Directory (or file path with `subPath`) where content appears |
| `readOnly` | Container cannot write through this mount |
| `subPath` | Expose only one file/subdirectory of the volume |
| `subPathExpr` | Like `subPath`, but can embed env vars (e.g. Pod name) |
| `mountPropagation` | How mount events propagate to/from the host (advanced; mostly for agents) |

### Overlays and empty dirs

If `mountPath` is `/etc/app` and the image already has `/etc/app`, the **volume hides** (overlays) that directory for as long as the mount exists. Image content under that path is not visible unless you use tricks like `subPath` for single files.

---

## Common volume sources

### `emptyDir` — scratch space for the Pod lifetime

```yaml
volumes:
  - name: scratch
    emptyDir:
      sizeLimit: 1Gi
      # medium: Memory    # tmpfs in RAM
```

- Created when the Pod is assigned to a node; deleted when the Pod is removed
- Shared by all containers that mount it (classic log-shipper sidecar pattern)
- Node disk (or memory if `medium: Memory`)

### `configMap` — mount config as files

```yaml
volumes:
  - name: config
    configMap:
      name: my-config
      defaultMode: 0444
      optional: false
      items:                         # optional: pick keys → paths
        - key: app.properties
          path: app.properties
```

Each ConfigMap **key** becomes a **file** whose content is the value.

Updates to a ConfigMap are projected eventually into the volume (not always instant; apps may need to reload). Using `subPath` **disables** automatic updates for that mount.

### `secret` — same idea, for sensitive data

```yaml
volumes:
  - name: tls
    secret:
      secretName: my-tls
      defaultMode: 0400
```

Prefer file mounts over env vars for secrets when you care about process listing / accidental logs. Still: Secrets are base64 in etcd (encrypt etcd / use external stores for stronger threat models).

### `persistentVolumeClaim` — durable storage

```yaml
volumes:
  - name: data
    persistentVolumeClaim:
      claimName: my-pvc
      readOnly: false
```

- PVC binds to a `PersistentVolume` (static or via `StorageClass`)
- Data can outlive the Pod
- Access modes matter: `ReadWriteOnce` (often one node), `ReadWriteMany`, `ReadOnlyMany`

### `projected` — combine several sources in one mount

```yaml
volumes:
  - name: all-in-one
    projected:
      sources:
        - configMap:
            name: my-config
        - secret:
            name: my-secret
        - serviceAccountToken:
            path: token
            expirationSeconds: 3600
        - downwardAPI:
            items:
              - path: labels
                fieldRef:
                  fieldPath: metadata.labels
```

Useful for “one directory with everything” and short-lived service account tokens.

### Other sources you will see

| Source | Typical use |
|--------|-------------|
| `csi` | Cloud disks, secrets-store CSI, vendors |
| `nfs` | Shared NFS export |
| `hostPath` | Node filesystem (avoid in portable prod apps) |
| `downwardAPI` | Expose Pod fields/labels as files |
| `pvc` ephemeral (`ephemeral`) | Inline PVC template per Pod |
| `image` / OCI (newer) | Mount an OCI image as a volume |

---

## Multi-container sharing

```yaml
spec:
  containers:
    - name: app
      volumeMounts:
        - name: logs
          mountPath: /var/log/app
    - name: shipper
      volumeMounts:
        - name: logs
          mountPath: /input
          readOnly: true
  volumes:
    - name: logs
      emptyDir: {}
```

Both containers see the **same** files. Writer + reader sidecars rely on this.

---

## Deployment / Pod template placement

In a Deployment, volumes live under the Pod template:

```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
        - name: web
          volumeMounts:
            - name: data
              mountPath: /var/lib/web
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: web-pvc
```

Same rules as a bare Pod — only nesting is deeper.

---

## Lifecycle: what survives

| Volume type | Survives container restart? | Survives Pod delete? | Survives node loss? |
|-------------|----------------------------|----------------------|---------------------|
| `emptyDir` | Yes (same Pod) | No | No |
| `configMap` / `secret` | Yes (re-projected) | N/A (objects remain) | Rebuilt on new node |
| PVC (network/disk) | Yes | Yes (PVC kept) | Depends on storage |
| `hostPath` | Yes on that node | Path remains on node | Tied to that node |

---

## `subPath` vs whole-volume mount

**Whole volume** → directory populated with all keys/files:

```text
mountPath /etc/app
  ├── app.properties
  └── feature.flag
```

**`subPath`** → single item, often to avoid hiding the rest of a directory:

```yaml
volumeMounts:
  - name: config
    mountPath: /etc/app/app.properties   # file path
    subPath: app.properties              # key/file inside volume
```

Caveat: ConfigMap/Secret mounts using `subPath` are **not** updated automatically when the object changes.

---

## Permissions and ownership

- `defaultMode` on ConfigMap/Secret sets file mode (e.g. `0444`, `0400`)
- Pod `securityContext.fsGroup` can make volumes group-readable by your process
- `fsGroupChangePolicy: OnRootMismatch` avoids chown on every start when possible
- Read-only root filesystem containers often need `emptyDir` mounts for `/tmp` and writable cache dirs

```yaml
spec:
  securityContext:
    fsGroup: 2000
    runAsUser: 1000
  containers:
    - name: app
      securityContext:
        readOnlyRootFilesystem: true
      volumeMounts:
        - name: tmp
          mountPath: /tmp
  volumes:
    - name: tmp
      emptyDir: {}
```

---

## Block volumes (`volumeDevices`)

Rare for apps; used when you need a raw block device instead of a filesystem:

```yaml
volumeDevices:
  - name: data
    devicePath: /dev/xvda
volumes:
  - name: data
    persistentVolumeClaim:
      claimName: block-pvc
```

Most apps use `volumeMounts` (filesystem), not `volumeDevices`.

---

## End-to-end PVC flow (persistent)

```
Pod volumeMount  →  Pod volume (PVC claimName)
                         →
                   PersistentVolumeClaim
                         →
                   PersistentVolume  (bound)
                         →
                   Storage backend (EBS, Azure Disk, NFS, Ceph, …)
```

Provisioning styles:

- **Static:** admin creates PV; PVC binds to it
- **Dynamic:** PVC names a `StorageClass`; provisioner creates the PV

---

## Common pitfalls

1. **Name mismatch** — `volumeMounts.name` ≠ any `volumes.name` → container fails to start.
2. **Missing object** — ConfigMap/Secret/PVC not found (unless `optional: true`).
3. **Overwrite surprise** — mounting at `/etc` hides the image’s `/etc`.
4. **`subPath` + ConfigMap updates** — files go stale; prefer full directory mounts if you need live updates.
5. **RWO PVC + multiple nodes** — two Pods on different nodes cannot both mount `ReadWriteOnce` (usually).
6. **Forgetting writable mounts** with `readOnlyRootFilesystem: true` — app crashes writing to `/tmp`.
7. **`hostPath` in prod** — not portable; scheduling and security issues.

---

## Debug checklist

```bash
kubectl describe pod <pod>          # Events: FailedMount, timeouts
kubectl get pvc,pv
kubectl exec -it <pod> -- ls -la /mount/path
kubectl exec -it <pod> -c shipper -- ls -la /input
```

Look for `FailedMount`, `Timeout expired waiting for volumes`, and CSI driver errors in Events.

---

## Quick decision guide

```
Need disk that outlives the Pod?
  └─ yes → PVC (+ StorageClass)
Need config/secrets as files?
  └─ ConfigMap / Secret / projected / CSI secrets
Need scratch space or sidecar file sharing?
  └─ emptyDir
Need node-specific path?
  └─ hostPath (usually only for agents)
```

---

## Related docs in this guide

- [deployment-anatomy.md](deployment-anatomy.md) — containers and mounts in Deployments
- [deployment-complete-example.md](deployment-complete-example.md) — many volume types in one manifest
- [sidecar-patterns.md](sidecar-patterns.md) — shared volumes between app and sidecar
- [k8s-kinds.md](k8s-kinds.md) — `PersistentVolume`, `PersistentVolumeClaim`, `StorageClass`

---

## Further reading

- [Volumes](https://kubernetes.io/docs/concepts/storage/volumes/)
- [Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)
- [Configure a Pod to Use a ConfigMap](https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/)
