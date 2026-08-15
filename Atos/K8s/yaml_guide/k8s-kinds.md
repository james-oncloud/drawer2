# Kubernetes YAML `kind` Reference

Every Kubernetes manifest has a `kind` field. That tells the API which resource type the YAML describes.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: example
```

Below are the common built-in kinds, grouped by role.

---

## Workloads (run containers)

| Kind | Purpose |
|------|---------|
| `Pod` | Smallest deployable unit; one or more containers |
| `ReplicaSet` | Keeps a stable set of Pod replicas running |
| `Deployment` | Declarative updates for Pods/ReplicaSets (rolling updates) |
| `StatefulSet` | Stateful apps with stable identity and storage |
| `DaemonSet` | One Pod per node (e.g. logging, networking agents) |
| `Job` | Run Pods to completion (batch) |
| `CronJob` | Schedule Jobs on a time table |
| `ReplicationController` | Legacy replica controller (prefer ReplicaSet/Deployment) |

---

## Services & networking

| Kind | Purpose |
|------|---------|
| `Service` | Stable network endpoint for Pods |
| `Endpoints` / `EndpointSlice` | Backend addresses for a Service |
| `Ingress` | HTTP(S) routing into the cluster |
| `IngressClass` | Which Ingress controller to use |
| `NetworkPolicy` | Pod-level network allow/deny rules |
| `Gateway` | Gateway API listener (newer Ingress alternative) |
| `HTTPRoute` | Gateway API HTTP routing rules |
| `GatewayClass` | Gateway API controller class |

---

## Configuration & secrets

| Kind | Purpose |
|------|---------|
| `ConfigMap` | Non-secret config data |
| `Secret` | Sensitive data (base64-encoded) |
| `ResourceQuota` | Limit resource use in a namespace |
| `LimitRange` | Default/min/max resource limits per Pod/container |
| `HorizontalPodAutoscaler` | Scale replicas from CPU/memory/custom metrics |
| `VerticalPodAutoscaler` | Suggest/set container resource requests (add-on) |
| `PodDisruptionBudget` | Limits voluntary disruptions during maintenance |

---

## Storage

| Kind | Purpose |
|------|---------|
| `PersistentVolume` | Cluster storage resource |
| `PersistentVolumeClaim` | Request for storage by a Pod |
| `StorageClass` | Dynamic provisioning parameters |
| `VolumeAttachment` | Volume attached to a node |
| `CSIDriver` / `CSINode` / `CSIStorageCapacity` | CSI storage plugin objects |

---

## Identity & access (RBAC)

| Kind | Purpose |
|------|---------|
| `ServiceAccount` | Identity for Pods |
| `Role` | Permissions within a namespace |
| `ClusterRole` | Cluster-wide (or reusable) permissions |
| `RoleBinding` | Bind a Role to users/SAs in a namespace |
| `ClusterRoleBinding` | Bind a ClusterRole cluster-wide |
| `User` / `Group` | Represented in auth, not usually YAML-created |

---

## Cluster / node / scheduling

| Kind | Purpose |
|------|---------|
| `Node` | Worker (or control-plane) machine |
| `Namespace` | Scope for names and resources |
| `PriorityClass` | Pod scheduling priority |
| `RuntimeClass` | Container runtime handler |
| `Lease` | Coordination / leader election |
| `Event` | Cluster event records |
| `ComponentStatus` | Legacy control-plane health (deprecated) |

---

## Policy & admission

| Kind | Purpose |
|------|---------|
| `PodSecurityPolicy` | Legacy Pod security (removed in newer K8s) |
| `ValidatingWebhookConfiguration` | Admission validation webhooks |
| `MutatingWebhookConfiguration` | Admission mutation webhooks |
| `ValidatingAdmissionPolicy` | CEL-based validation (no webhook) |
| `ValidatingAdmissionPolicyBinding` | Bind admission policies |
| `FlowSchema` / `PriorityLevelConfiguration` | API Priority and Fairness |

---

## Custom & extension

| Kind | Purpose |
|------|---------|
| `CustomResourceDefinition` | Registers a new API `kind` |
| *(your CR kinds)* | Anything defined by a CRD (e.g. `Certificate`, `Prometheus`, `HelmRelease`) |

Operators and Helm charts often introduce many extra `kind` values beyond the built-ins.

---

## Quick mental model

```
Namespace
  └── Deployment / StatefulSet / DaemonSet / Job / CronJob
        └── Pod(s)
              └── containers (+ volumes from PVC / ConfigMap / Secret)

Service  ──► selects Pods
Ingress / Gateway ──► routes to Service
```

---

## See also

- List kinds on a live cluster: `kubectl api-resources`
- Describe one kind: `kubectl explain Deployment`
- Full API: [Kubernetes API reference](https://kubernetes.io/docs/reference/kubernetes-api/)
