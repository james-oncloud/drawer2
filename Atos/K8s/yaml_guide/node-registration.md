# Registering a New Node with a Kubernetes Cluster

A **node** joins the cluster when its **kubelet** authenticates to the **API server** and creates/updates a `Node` object. The scheduler then sees that node’s `status.capacity` / `status.allocatable` and can place Pods on it.

```
New machine
  → install runtime + kubelet (+ kube-proxy)
  → kubelet authenticates to API server
  → Node object appears
  → CNI ready → Node Ready
  → scheduler can place Pods
```

Resource “limits” on a node are not a Pod `resources.limits` block. They are **kubelet reservations** that shrink **allocatable** capacity reported to the scheduler.

---

## What “registration” means

| Step | Who | Result |
|------|-----|--------|
| 1. Machine ready | You / cloud | OS, networking, container runtime |
| 2. kubelet starts with cluster config | You / node bootstrap | Client cert or token to talk to API |
| 3. Node API object created | kubelet | `kubectl get nodes` shows the node |
| 4. Capacity published | kubelet | `status.capacity` / `status.allocatable` |
| 5. CNI + proxy ready | CNI DaemonSet / kube-proxy | Pod networking works; node `Ready` |

There is no separate `kubectl register-node` for normal setups — **joining = running a correctly configured kubelet**.

---

## Paths to add a node

### A. kubeadm (self-managed)

On an existing control plane, create a join token:

```bash
kubeadm token create --print-join-command
```

On the **new worker**:

```bash
# Example output — use your real token/hash
kubeadm join api.example.com:6443 \
  --token <token> \
  --discovery-token-ca-cert-hash sha256:<hash>
```

That installs/configures kubelet, obtains credentials, and registers the Node.

Verify:

```bash
kubectl get nodes
kubectl get nodes -o wide
```

### B. Managed Kubernetes (EKS / GKE / AKS)

You rarely join by hand. You add capacity via a **node group / node pool**:

- EKS: managed node group or Karpenter / ASG
- GKE: node pool
- AKS: node pool / VMSS

The provider image already runs kubelet; VMs register automatically when they boot into the pool.

### C. Manual / DIY kubelet

1. Install container runtime (e.g. containerd)
2. Install kubelet (and usually kube-proxy as static Pod or DaemonSet)
3. Point kubelet at the API server with a **bootstrap token** or **certificate**
4. Ensure CNI is installed in the cluster so the node can become Ready

This is how cloud node images and tools like kops/Cluster API work under the hood.

---

## Minimum software on the worker

| Component | Role |
|-----------|------|
| **container runtime** | CRI (containerd / CRI-O) |
| **kubelet** | Registers node; runs Pods |
| **kube-proxy** (or CNI replacement) | Service cluster IPs |
| **CNI plugin** | Pod network (often installed as DaemonSet once per cluster) |

Control-plane components (`etcd`, `kube-scheduler`, …) are **not** installed on workers.

---

## Resource limits on the node (allocatable)

When the node registers, kubelet advertises:

```text
capacity     = full machine (CPU, memory, ephemeral-storage, …)
allocatable  = capacity − reserved − eviction thresholds
```

The **scheduler** places Pods using **allocatable**, not raw capacity.

### Configure reservations (kubelet)

Set on the new node **before or at join** (kubeadm ConfigMap / kubelet config / systemd flags).

**KubeletConfiguration** example (`/var/lib/kubelet/config.yaml`):

```yaml
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
# ... other settings ...

systemReserved:
  cpu: 500m
  memory: 1Gi
  ephemeral-storage: 2Gi

kubeReserved:
  cpu: 500m
  memory: 1Gi
  ephemeral-storage: 2Gi

# Soft/hard eviction — also reduces schedulable memory/storage
evictionHard:
  memory.available: 500Mi
  nodefs.available: 10%
  imagefs.available: 15%

# Optional: enforce that reserved + eviction fit on the machine
enforceNodeAllocatable:
  - pods
```

**Equivalent CLI style** (older / flags on kubelet unit):

```text
--system-reserved=cpu=500m,memory=1Gi,ephemeral-storage=2Gi
--kube-reserved=cpu=500m,memory=1Gi,ephemeral-storage=2Gi
--eviction-hard=memory.available<500Mi,nodefs.available<10%
```

| Setting | Purpose |
|---------|---------|
| **systemReserved** | OS + system daemons (ssh, journald, …) |
| **kubeReserved** | kubelet, container runtime, node agents |
| **evictionHard** | Thresholds that trigger Pod eviction; reserved from allocatable |

### Example math

| | CPU | Memory |
|---|-----|--------|
| Capacity | 8 | 32 Gi |
| systemReserved | 0.5 | 1 Gi |
| kubeReserved | 0.5 | 1 Gi |
| eviction (memory) | — | ~0.5 Gi |
| **Allocatable** | ~7 | ~29.5 Gi |

```bash
kubectl describe node <node-name>
# Capacity:    ...
# Allocatable: ...   ← scheduler uses this
```

### kubeadm: set reservations at join time

`KubeletConfiguration` in the kubeadm config used when joining:

```yaml
apiVersion: kubeadm.k8s.io/v1beta3
kind: JoinConfiguration
discovery:
  bootstrapToken:
    apiServerEndpoint: api.example.com:6443
    token: <token>
    caCertHashes:
      - sha256:<hash>
nodeRegistration:
  kubeletExtraArgs:
    node-labels: "role=worker,disk=ssd"
    # flags also possible; prefer full KubeletConfiguration file when you can
---
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
systemReserved:
  cpu: 500m
  memory: 1Gi
kubeReserved:
  cpu: 500m
  memory: 1Gi
evictionHard:
  memory.available: 500Mi
  nodefs.available: 10%
```

(Exact kubeadm version fields vary slightly — match your cluster’s kubeadm API.)

---

## Labels, taints, and roles at registration

Pin workloads or protect nodes when they join:

```yaml
# JoinConfiguration.nodeRegistration (kubeadm)
nodeRegistration:
  name: worker-03
  taints:
    - key: dedicated
      value: gpu
      effect: NoSchedule
  kubeletExtraArgs:
    node-labels: "node.kubernetes.io/role=worker,accelerator=nvidia-gpu"
```

Or after join:

```bash
kubectl label node worker-03 disk=ssd
kubectl taint nodes worker-03 dedicated=gpu:NoSchedule
```

Control-plane nodes usually already have:

```text
node-role.kubernetes.io/control-plane:NoSchedule
```

---

## Extended resources (GPUs, etc.)

1. Join the node as usual
2. Install device drivers + **device plugin** DaemonSet (e.g. NVIDIA)
3. Kubelet publishes `nvidia.com/gpu` (or similar) on `capacity` / `allocatable`
4. Pods request that resource; scheduler matches it

No separate “register GPU with scheduler” step beyond the device plugin updating Node status.

---

## Namespace / Pod resource limits vs node limits

Do not confuse these:

| Layer | Mechanism | Effect |
|-------|-----------|--------|
| **Node** | `kubeReserved` / `systemReserved` / eviction | Shrinks **allocatable** for the whole node |
| **Namespace** | `ResourceQuota` / `LimitRange` | Caps what a team can request |
| **Pod** | `resources.requests` / `limits` | Scheduling + cgroup enforcement |

Node registration configures the **node** row. Pod YAML still needs its own requests/limits.

---

## Checklist: add a worker with sane capacity

1. Provision VM/bare metal (CPU/RAM/disk sized for workloads + reservations)
2. Install OS packages, containerd, kubelet version matching control plane
3. Set **kubeReserved** / **systemReserved** / **evictionHard**
4. `kubeadm join` (or attach to managed node group)
5. Confirm:
   ```bash
   kubectl get node <name>
   kubectl get node <name> -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}'
   kubectl describe node <name>   # Allocatable looks right
   ```
6. Confirm CNI Pods run on the node; Ready = True
7. Optional: labels/taints for placement
8. Optional: drain test — schedule a tiny Pod and see it land

---

## Remove or replace a node

```bash
kubectl drain <name> --ignore-daemonsets --delete-emptydir-data
kubectl delete node <name>
# then shut down or rejoin the machine
```

On the machine, stop kubelet / reset:

```bash
kubeadm reset   # if kubeadm-managed
```

---

## Troubleshooting registration

| Symptom | Likely cause |
|---------|----------------|
| Node never appears | kubelet not running; wrong API endpoint; auth/token expired |
| Node `NotReady` | CNI not installed; runtime down; kubelet crashed |
| `NotReady` + network errors | Firewall to API server `:6443` or node ports |
| Allocatable ≈ Capacity | Reservations not applied (config not loaded) |
| Pods Pending after join | Taints, insufficient allocatable, or disk pressure |

```bash
journalctl -u kubelet -f
kubectl describe node <name>
kubectl get pods -A -o wide | grep <name>
```

---

## Related docs in this guide

- [resource-scheduling.md](resource-scheduling.md) — how allocatable drives scheduling; how capacity is published
- [k8s-architecture.md](k8s-architecture.md) — kubelet on the worker
- [k8s_tips.md](k8s_tips.md) — Pod-level requests/limits

---

## Further reading

- [Adding worker nodes (kubeadm)](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/#join-nodes)
- [Reserve compute resources](https://kubernetes.io/docs/tasks/administer-cluster/reserve-compute-resources/)
- [Node](https://kubernetes.io/docs/concepts/architecture/nodes/)
- [KubeletConfiguration](https://kubernetes.io/docs/reference/config-api/kubelet-config.v1beta1/)
