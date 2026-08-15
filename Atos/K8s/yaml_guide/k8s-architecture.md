# Kubernetes Architecture: Control Plane & Worker Nodes

A Kubernetes cluster is split into two roles:

| Layer | What it is | Responsibility |
|-------|------------|----------------|
| **Control plane** | Brain of the cluster | API, desired state, scheduling, cluster decisions |
| **Worker nodes** | Machines that run Pods | Execute containers, report health, attach networking/storage |

```
                    ┌─────────────────────────────────────┐
                    │           Control plane             │
                    │  API Server · etcd · Scheduler      │
                    │  Controller Manager · Cloud Manager │
                    └─────────────────┬───────────────────┘
                                      │ kube-apiserver
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
              ┌──────────┐     ┌──────────┐     ┌──────────┐
              │  Worker  │     │  Worker  │     │  Worker  │
              │ kubelet  │     │ kubelet  │     │ kubelet  │
              │ kube-proxy│    │ kube-proxy│    │ kube-proxy│
              │ runtime  │     │ runtime  │     │ runtime  │
              │  Pods…   │     │  Pods…   │     │  Pods…   │
              └──────────┘     └──────────┘     └──────────┘
```

You talk to the cluster through the **API server** (`kubectl`, controllers, operators, CI). Workers never take desired-state decisions on their own — they **reconcile** what the control plane tells them.

---

## Big picture: desired state loop

1. You apply a manifest → stored in **etcd** via the **API server**
2. **Controllers** notice desired vs actual drift and create/update objects (e.g. ReplicaSets, Pods)
3. **Scheduler** assigns pending Pods to nodes
4. Each node’s **kubelet** starts the Pod via the **container runtime**
5. **kube-proxy** (and/or CNI / kube-proxy replacements) makes **Services** reachable
6. Status flows back up to the API server → etcd

That continuous reconcile loop is the core of Kubernetes.

---

## Control plane components

Usually run on dedicated control-plane node(s). In managed Kubernetes (EKS, GKE, AKS, …) the provider runs most of this for you.

### 1. `kube-apiserver` — the front door

**Role:** Central REST API for the cluster. Only component that talks directly to etcd in a typical setup.

| Does | Does not |
|------|----------|
| Authenticate & authorize requests | Schedule Pods itself |
| Validate and admit objects (schemas, webhooks, policies) | Run application containers |
| Store/retrieve state in etcd | |
| Notify watchers (controllers, kubectl watch) | |

Everything — `kubectl`, controllers, kubelets, operators — is an **API client**.

```text
kubectl apply  →  kube-apiserver  →  etcd
                     ↑
              kubelet / controllers / operators
```

**High availability:** multiple API server replicas behind a load balancer.

---

### 2. `etcd` — cluster state store

**Role:** Consistent, highly available key-value store for all cluster data.

Stores (among other things):

- API objects: Pods, Deployments, Services, Secrets, …
- Metadata: resource versions, leases, events (as objects)

| Does | Does not |
|------|----------|
| Persist desired + reported state | Run workloads |
| Provide watch/consistency for the API | Make scheduling decisions |

**Ops notes:** critical to back up; performance and quorum matter in multi-member etcd. Lose etcd without a backup → lose the cluster’s memory.

---

### 3. `kube-scheduler` — place Pods on nodes

**Role:** Watches for Pods with no `nodeName` and binds each to a suitable worker.

Decision pipeline (simplified):

1. **Filter** — nodes that *can* run the Pod (resources, affinity, taints/tolerations, ports, …)
2. **Score** — rank feasible nodes (least requested, affinity preferences, topology, …)
3. **Bind** — write the chosen node back through the API server

| Does | Does not |
|------|----------|
| Choose *which node* runs a Pod | Start containers (kubelet does) |
| Honor affinity, taints, resource requests, topology spread | Manage Deployments/ReplicaSets |

Custom schedulers can coexist (`schedulerName` on the Pod).

---

### 4. `kube-controller-manager` — built-in control loops

**Role:** Runs many **controllers** in one process. Each controller reconciles one kind of desired state.

Examples:

| Controller | Responsibility |
|------------|----------------|
| **Deployment / ReplicaSet** | Keep the right number of Pods; roll out updates |
| **Job** | Run Pods to completion |
| **Node** | Notice unhealthy nodes; trigger eviction logic |
| **Endpoint / EndpointSlice** | Keep Service backends in sync with ready Pods |
| **Namespace** | Clean up when a namespace is deleted |
| **ServiceAccount** | Ensure default SA/tokens exist as needed |
| **PersistentVolume** | Bind PVs/PVCs |

Pattern every controller follows:

```text
observe API objects → compare desired vs actual → write fixes via API server
```

| Does | Does not |
|------|----------|
| Create/update/delete API objects to fix drift | Execute containers on nodes |
| Encode most of Kubernetes “behavior” | Replace the scheduler |

---

### 5. `cloud-controller-manager` — cloud provider glue

**Role:** Controllers that talk to a cloud API (AWS, Azure, GCP, …). Split out so core Kubernetes stays cloud-agnostic.

Typical duties:

- Routes / load balancers for `Service` `type: LoadBalancer`
- Node lifecycle tied to cloud VMs (delete node object when VM is gone)
- Network routes / IP management (provider-specific)
- Cloud volume attach/detach coordination (with CSI)

On bare metal or when networking/storage is fully in-cluster, this may be minimal or unused.

---

### Control plane summary

| Component | One-line role |
|-----------|----------------|
| **kube-apiserver** | Cluster API; gateway to state |
| **etcd** | Durable source of truth |
| **kube-scheduler** | Assign Pods → nodes |
| **kube-controller-manager** | Reconcile built-in resources |
| **cloud-controller-manager** | Cloud-specific reconcile loops |

---

## Worker node components

Every worker (and often control-plane nodes if they run workloads) runs node agents plus a container runtime.

### 1. `kubelet` — node agent

**Role:** Kubernetes agent on the node. Ensures Pods assigned to this node are running and healthy.

| Does | Does not |
|------|----------|
| Watch API for Pods bound to this node | Make cluster-wide decisions |
| Ask the container runtime to create/start/stop containers | Store cluster state (that’s etcd) |
| Mount volumes, run probes, report Pod/node status | Replace CNI (it calls it) |
| Register the node with the cluster | |

Reports: node conditions (Ready, MemoryPressure, …), Pod status, resource usage capacity/allocatable.

If kubelet dies, new Pods will not start correctly on that node; existing containers may keep running until something else intervenes.

---

### 2. Container runtime — run containers

**Role:** Pull images and run containers. kubelet talks to it via **CRI** (Container Runtime Interface) — e.g. **containerd** or **CRI-O**.

| Does | Does not |
|------|----------|
| Image pull/cache | Schedule which node |
| Create container namespaces, cgroups | Own Service VIP logic |
| Stream logs / exec attach (via kubelet/API) | |

Docker Engine as a direct runtime was deprecated; clusters use CRI-compatible runtimes (often containerd under the hood).

---

### 3. `kube-proxy` — Service networking on the node

**Role:** Implements the node side of Kubernetes **Services** by programming packet rules (iptables, IPVS, or nftables mode) so traffic to a Service IP/port reaches backend Pods.

| Does | Does not |
|------|----------|
| Watch Services & EndpointSlices | Provide Pod-to-Pod CNI networking alone |
| Maintain load-balancing rules on the node | Replace Ingress / Gateway (L7) |

**Note:** Some CNIs or mesh modes **replace** kube-proxy (e.g. Cilium kube-proxy replacement). The *role* still exists; the *binary* might not.

---

### 4. Container Network Interface (CNI) plugin — Pod networking

Not a single binary shipped as “core” the same way, but **required** on every cluster.

**Role:** Give each Pod an IP, wire up routes/bridges/overlays, enforce NetworkPolicies (if the CNI supports them).

Examples: Cilium, Calico, Flannel, Amazon VPC CNI, Azure CNI.

```text
Pod A (10.0.1.5)  ←── CNI fabric ──→  Pod B (10.0.2.8)
         ↑
   Service ClusterIP  (via kube-proxy or CNI replacement)
```

---

### 5. Storage / device plugins (as needed)

| Piece | Role |
|-------|------|
| **CSI node plugin** | Mount/unmount volumes for Pods on this node |
| **Device plugins** | Advertise GPUs / FPGAs / other hardware to kubelet |
| **Node-local agents** (optional) | Log shippers, security sensors — often DaemonSets, not “core” |

---

### Worker node summary

| Component | One-line role |
|-----------|----------------|
| **kubelet** | Make this node’s Pods match the API |
| **Container runtime** | Run container processes |
| **kube-proxy** (or replacement) | Implement Service traffic rules |
| **CNI plugin** | Pod network identity & connectivity |
| **CSI node plugin** | Attach/mount storage for Pods |

---

## How a Pod starts (component walkthrough)

```
1. User: kubectl apply -f deployment.yaml
2. API server validates → writes Deployment to etcd
3. Deployment controller → creates ReplicaSet → creates Pod objects (Pending)
4. Scheduler binds Pod.spec.nodeName = worker-3
5. kubelet on worker-3 sees the Pod
6. CSI (if needed) mounts volumes
7. Runtime pulls image & starts containers
8. CNI assigns Pod IP
9. kubelet runs probes; reports Ready
10. EndpointSlice controller adds Pod to Service backends
11. kube-proxy/CNI updates rules so ClusterIP traffic can reach it
```

---

## Control plane vs worker — responsibility split

| Concern | Control plane | Worker |
|---------|---------------|--------|
| Store desired state | etcd + API | — |
| Decide placement | scheduler | — |
| Reconcile Deployments/Jobs/… | controller-manager | — |
| Start containers | — | kubelet + runtime |
| Pod IP / routes | — | CNI |
| Service VIP / LB rules | objects in API | kube-proxy / CNI / cloud LB |
| Report health | aggregates status | kubelet heartbeats & probes |

---

## Single-node & managed variants

| Setup | What changes |
|-------|----------------|
| **kubeadm / self-managed** | You run all components; often 3 control-plane nodes for HA |
| **Managed K8s** | Provider runs API/etcd/controllers; you manage workers (node groups) |
| **Dev (kind / minikube / k3s)** | Components packed together; roles are the same, packaging differs |
| **Control-plane taints** | Production control-plane nodes often **tainted** so only system Pods run there |

---

## Add-ons (not “core” but almost always present)

| Add-on | Role |
|--------|------|
| **CoreDNS** | Cluster DNS for Service/Pod names |
| **Metrics Server** | Resource metrics for `kubectl top` and HPA |
| **Ingress / Gateway controller** | L7 HTTP(S) routing |
| **Dashboard / observability agents** | UI and telemetry |

These run as ordinary workloads (often in `kube-system`) but are part of a usable cluster architecture.

---

## Security boundary (short)

- Clients authenticate to the **API server** (certs, tokens, OIDC)
- **RBAC** decides what each identity can do
- **kubelet** authenticates to the API; optionally serves a secured read API
- **NetworkPolicies** / service mesh restrict Pod traffic on workers
- etcd should be locked down (TLS, access only from API servers)

---

## Quick reference card

```
CONTROL PLANE
  kube-apiserver     → API + admission + gateway to etcd
  etcd               → source of truth
  kube-scheduler     → Pod → node binding
  kube-controller-manager → reconcile loops (Deployments, Nodes, Endpoints, …)
  cloud-controller-manager → cloud LBs, nodes, routes, …

WORKER NODE
  kubelet            → run/report Pods on this node
  container runtime  → images & containers (CRI)
  kube-proxy         → Service packet rules (or CNI replacement)
  CNI                → Pod network
  CSI node plugin    → volume mount/unmount
```

---

## Related docs in this guide

- [k8s-kinds.md](k8s-kinds.md) — API object types stored in etcd
- [deployment-anatomy.md](deployment-anatomy.md) — how a Deployment becomes Pods
- [volume-mounts.md](volume-mounts.md) — how kubelet + CSI put storage into containers
- [sidecar-patterns.md](sidecar-patterns.md) — multiple containers per Pod on a worker

---

## Further reading

- [Kubernetes Components](https://kubernetes.io/docs/concepts/overview/components/)
- [Nodes](https://kubernetes.io/docs/concepts/architecture/nodes/)
- [Control Plane-Node Communication](https://kubernetes.io/docs/concepts/architecture/control-plane-node-communication/)
