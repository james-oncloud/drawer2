# How Kubernetes Allocates Work to Nodes (by Resources)

Kubernetes does **not** place Pods by guessing how busy a node looks right now. The **scheduler** places Pods using **declared resource requests** against each node’s **allocatable** capacity. Limits affect runtime behavior (throttling / OOM), not the primary placement math.

```
Pod.spec.containers[].resources.requests
                 │
                 ▼
         kube-scheduler
    filter → score → bind
                 │
                 ▼
Node.status.allocatable  (CPU, memory, ephemeral-storage, …)
```

---

## Core idea

| Concept | Meaning |
|---------|---------|
| **Capacity** | Total resources on the machine |
| **Allocatable** | What Pods may use (capacity minus OS / kubelet reserved) |
| **Request** | Amount **reserved** for the Pod when scheduling |
| **Limit** | Max the container may use at runtime (enforced by kubelet/cgroups) |

**Scheduling uses requests. Runtime enforcement uses limits.**

If you omit requests, the scheduler treats CPU/memory demand as **0** for placement (unless a LimitRange injects defaults) — Pods pack densely and then fight for resources on the node (**noisy neighbor**).

---

## What the scheduler actually sums

For each node, roughly:

```text
used = sum( requests of Pods already on the node )
       + requests of the Pod being scheduled

feasible if:  used ≤ node.allocatable   (per resource)
```

Example:

| | CPU | Memory |
|---|-----|--------|
| Node allocatable | 4 cores | 16 Gi |
| Already scheduled Pods (sum of requests) | 2.5 | 10 Gi |
| New Pod requests | 1 | 4 Gi |
| After placement | 3.5 ≤ 4 ✓ | 14 Gi ≤ 16 Gi ✓ |

If the new Pod asked for `2` CPU → **Pending** (`Insufficient cpu`).

Multiple resources must **all** fit (CPU, memory, ephemeral-storage, extended resources like GPUs).

---

## Declaring resources on a container

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: ghcr.io/example/api:1.4.0
          resources:
            requests:
              cpu: "500m"          # 0.5 core reserved for scheduling
              memory: 256Mi        # 256 MiB reserved
              ephemeral-storage: 1Gi
            limits:
              cpu: "1"             # may burst up to 1 core
              memory: 512Mi        # hard cap; exceed → OOMKilled
              ephemeral-storage: 2Gi
```

### Units (quick)

| Resource | Examples |
|----------|----------|
| **CPU** | `1` = 1 core; `500m` = 0.5 core; `100m` = 0.1 core |
| **Memory** | `256Mi`, `1Gi`, `512M` (powers of 2 vs decimal — prefer `Mi`/`Gi`) |
| **ephemeral-storage** | Local disk for logs, emptyDir, image layers overlay |

For multi-container Pods, the scheduler adds **all containers’ requests** (plus init containers — see below).

---

## Init containers and sidecars

- **Init containers:** scheduling uses the **max** of each init container’s request vs the sum of app containers for that resource (init runs before app containers, so peak matters).
- **Native sidecars / extra containers:** their requests are included in the Pod total like normal containers.

Always set requests on sidecars too — they count toward bin-packing.

---

## Node capacity vs allocatable

```bash
kubectl describe node <node>
```

You will see something like:

```text
Capacity:
  cpu:                8
  memory:             32779684Ki
  ephemeral-storage:  ...
Allocatable:
  cpu:                7600m      # less than capacity
  memory:             30Gi       # kube/system reserved
```

**Allocatable** = capacity − kube-reserved − system-reserved − eviction thresholds (configured on the kubelet).

Pods are scheduled against **allocatable**, not raw capacity.

---

## Filter → score → bind (resource angle)

### 1. Filter (predicates)

Drop nodes that cannot fit the Pod:

- Not enough leftover allocatable for CPU / memory / storage / GPU
- Node taints not tolerated
- Affinity / nodeSelector / topology constraints fail
- Port conflicts, volume node affinity, etc.

### 2. Score (priorities)

Among feasible nodes, prefer better fits. Resource-related scoring often includes:

| Preference (simplified) | Effect |
|-------------------------|--------|
| **Least allocated** / balanced | Spread load; avoid packing one node full first |
| **Most allocated** (bin-packing style) | Pack denser (used by some configs / NodeAllocatable) |
| **RequestedToCapacityRatio** | Score by how requests fill remaining capacity |

Exact plugins depend on scheduler config; defaults aim for reasonable balance.

### 3. Bind

Write `Pod.spec.nodeName` via the API. The **kubelet** on that node then starts the Pod.

---

## Requests vs limits — two different jobs

```
┌─────────────────────────────────────────────┐
│  SCHEDULING (control plane)                 │
│  uses: requests                             │
│  “Is there a node with enough reserved?”    │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  RUNTIME (worker / cgroups)                 │
│  uses: limits (+ requests for CPU weight)   │
│  “How hard may this container push?”        │
└─────────────────────────────────────────────┘
```

| | CPU | Memory |
|---|-----|--------|
| **Below request** | Generally available | Generally available |
| **Between request and limit** | May use spare CPU; shares fairly when contended | Same for memory until pressure |
| **Above limit** | Throttled (CPU) | **OOMKilled** (memory) |

Memory limit is a hard wall. CPU limit throttles time slices (latency can rise without a crash).

---

## Quality of Service (QoS) classes

Kubernetes classifies Pods from how you set requests/limits. QoS affects **eviction order** when a node is under pressure.

| QoS | How you get it | Eviction preference |
|-----|----------------|---------------------|
| **Guaranteed** | Every container: request == limit for CPU & memory | Evicted last |
| **Burstable** | At least one request; not Guaranteed | Middle |
| **BestEffort** | No requests or limits | Evicted first |

```yaml
# Guaranteed (same request and limit)
resources:
  requests: { cpu: "1", memory: 1Gi }
  limits:   { cpu: "1", memory: 1Gi }

# Burstable (request < limit, or only requests set)
resources:
  requests: { cpu: 250m, memory: 256Mi }
  limits:   { cpu: "1",  memory: 1Gi }

# BestEffort
resources: {}   # avoid in production
```

---

## What “Pending” usually means (resources)

```bash
kubectl describe pod <pod>
```

Common events:

| Message | Cause |
|---------|--------|
| `Insufficient cpu` | Sum of CPU requests would exceed allocatable |
| `Insufficient memory` | Same for memory |
| `Insufficient ephemeral-storage` | Local disk request won’t fit |
| `Insufficient nvidia.com/gpu` | Extended resource not available |

Fix by: lowering requests, adding nodes, changing nodeSelector/taints, or fixing oversized sidecars.

---

## Horizontal vs vertical scaling (related)

| Mechanism | What it changes | Scheduling impact |
|-----------|-----------------|-------------------|
| **HPA** (Horizontal Pod Autoscaler) | `replicas` | More Pods → more total requests to place |
| **VPA** (Vertical Pod Autoscaler) | container requests/limits | Each Pod needs a bigger (or smaller) hole on a node |
| Manual `kubectl scale` | replicas | Same as HPA |

HPA typically needs Metrics Server (or custom metrics). It does not bypass resource fitting — new replicas still need nodes with free allocatable.

---

## LimitRange & ResourceQuota (namespace guardrails)

### LimitRange — defaults / min / max per Pod or container

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: defaults
  namespace: team-a
spec:
  limits:
    - type: Container
      defaultRequest:
        cpu: 100m
        memory: 128Mi
      default:
        cpu: 500m
        memory: 256Mi
      max:
        cpu: "2"
        memory: 2Gi
```

If a container omits resources, LimitRange can **inject** requests/limits so scheduling still has numbers.

### ResourceQuota — cap total requests in a namespace

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: team-a-quota
  namespace: team-a
spec:
  hard:
    requests.cpu: "8"
    requests.memory: 16Gi
    limits.cpu: "16"
    limits.memory: 32Gi
    pods: "40"
```

Even if a node has room, the API may reject a Pod that would blow the namespace quota.

---

## Bin-packing intuition

Think of each node as a bin of size `allocatable`. Each Pod is an item of size `requests`.

```
Node A  [████████░░░░]  8/12 CPU requested
Node B  [██████░░░░░░]  6/12 CPU requested
Pod     needs 5 CPU

Both feasible → scheduler scores (often prefers spreading or packing
depending on config) → binds to one node → kubelet starts Pod
```

**Overcommit:** if limits ≫ requests, many Pods can be scheduled onto a node whose **limits** sum above allocatable. That is allowed; under contention, CPU throttles and memory may OOM/evict. Requests are the promise; limits are the leash.

---

## Extended resources (e.g. GPU)

```yaml
resources:
  requests:
    nvidia.com/gpu: 1
  limits:
    nvidia.com/gpu: 1
```

Nodes advertise extended resources via device plugins. Scheduler filters nodes that have enough countable devices — same request ≤ allocatable model.

---

## Practical guidelines

1. **Always set requests** for CPU and memory on every container (including sidecars).
2. Set **limits** especially for memory (prevent unbounded growth).
3. Size requests from real usage (`kubectl top`, metrics, load tests) — not from guess-forever.
4. Prefer **Burstable** for most apps; **Guaranteed** for latency-critical components.
5. Leave **headroom** on nodes for DaemonSets, bursts, and eviction thresholds.
6. Use **ResourceQuota** so one team cannot schedule away the whole cluster.
7. Remember: fixing Pending is often “more capacity or smaller requests,” not “restart the scheduler.”

---

## Inspect allocation

```bash
# Node leftover vs capacity
kubectl describe node <node> | sed -n '/Allocated resources/,/Events/p'

# Pod requests as scheduled
kubectl get pod <pod> -o jsonpath='{.spec.containers[*].resources}'

# Live usage (needs metrics-server) — NOT what scheduler uses
kubectl top nodes
kubectl top pods
```

`kubectl top` shows **usage**. Scheduling uses **requests**. A node can look “idle” in `top` but still refuse Pods if requests are fully reserved.

---

## Walkthrough: one Pod lands on a node

```
1. Deployment creates Pod (Pending, no nodeName)
2. Scheduler lists nodes
3. Filters out nodes where allocatable - reservedRequests < pod.requests
4. Scores remaining nodes
5. Binds Pod → worker-02
6. kubelet reserves cgroups based on requests/limits
7. Runtime starts containers
8. If memory hits limit → OOMKilled
9. If node memory pressure → kubelet evicts BestEffort / large Burstable first
```

---

## Related docs in this guide

- [k8s-architecture.md](k8s-architecture.md) — scheduler & kubelet roles
- [k8s_tips.md](k8s_tips.md) — why requests/limits matter in production
- [deployment-anatomy.md](deployment-anatomy.md) — where `resources` sit in YAML
- [deployment-complete-example.md](deployment-complete-example.md) — full `resources` block

---

## Further reading

- [Resource Management for Pods and Containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
- [Node Allocatable](https://kubernetes.io/docs/tasks/administer-cluster/reserve-compute-resources/)
- [Pod QoS Classes](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/)
- [Scheduler](https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/)

---

## How a Node declares capacity to the scheduler

The node does **not** talk to the scheduler directly. The **kubelet** reports capacity into a **Node** API object; the scheduler **watches** that object.

### 1. Kubelet discovers the machine

On startup (and periodically), the kubelet reads local hardware/OS info:

- CPU count
- Memory
- Ephemeral storage
- Hugepages, etc.

That becomes **`Node.status.capacity`** — raw machine size.

### 2. Kubelet computes what Pods may use

It subtracts reservations configured on the kubelet:

```text
allocatable ≈ capacity
             − system-reserved
             − kube-reserved
             − eviction-hard thresholds (memory/storage)
```

That becomes **`Node.status.allocatable`** — what the **scheduler** actually uses.

### 3. Kubelet registers / updates the Node via the API

The kubelet is an API client. It **creates or patches** the `Node` object:

```text
kubelet  →  kube-apiserver  →  etcd
              Node.status.capacity
              Node.status.allocatable
              Node.status.conditions (Ready, …)
```

Heartbeats / status updates keep that fresh (`Node.status` and often a `Lease` in `kube-node-lease`).

### 4. Scheduler only reads the API

The scheduler does **not** poll nodes over SSH. It watches `Node` objects and filters with:

```text
pod.requests ≤ node.status.allocatable − sum(requests of Pods on that node)
```

### Extended resources (GPUs, etc.)

**Device plugins** register with the kubelet; the kubelet adds things like `nvidia.com/gpu: 2` into `capacity` / `allocatable`. Same publication path.

### See it

```bash
kubectl get node <name> -o jsonpath='{.status.capacity}{"\n"}{.status.allocatable}{"\n"}'
kubectl describe node <name>
```

**Summary:** the node “declares” capacity by the **kubelet writing `status.capacity` / `status.allocatable` on the Node API object**; the scheduler consumes that from the control plane, not from a direct node channel.
