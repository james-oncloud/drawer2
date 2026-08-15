# Kubernetes failure scenarios

Common symptoms, investigation commands, and fix directions.

## Universal investigation order

1. **Scope** — What is broken vs healthy?
   ```bash
   kubectl get pods,svc,ingress,nodes -A   # or -n <ns>
   ```
2. **Object** — Events and Conditions beat guessing.
   ```bash
   kubectl describe <kind> <name> -n <ns>
   ```
3. **Logs** — App + sidecar; check initContainers.
   ```bash
   kubectl logs <pod> -n <ns> [--previous] [-c <container>]
   ```
4. **Cluster signals** — Events, metrics, CNI/CSI/controller logs, cloud provider health.

### Useful one-liners

```bash
kubectl get events -A --sort-by=.lastTimestamp | tail -50
kubectl get pods -A --field-selector=status.phase!=Running
kubectl top nodes
kubectl top pods -A --sort-by=memory
```

### Quick decision map

| Symptom | Where to look |
|---|---|
| Pending | Scheduling / PVC / quota |
| ImagePull* | Registry / secrets |
| CrashLoop* | `logs --previous` |
| OOMKilled | Memory limit / leak |
| Ready 0/1 | Readiness probe |
| No Endpoints | Selector / port |
| DNS fail | CoreDNS / NetPol |
| Edge only | Ingress / TLS / LB |

---

## Pods

### CrashLoopBackOff

**Symptom:** Pod restarts repeatedly; status `CrashLoopBackOff`.

**Investigate:**
```bash
kubectl get pods -n <ns> -o wide
kubectl describe pod <pod> -n <ns>
kubectl logs <pod> -n <ns> --previous
kubectl get events -n <ns> --sort-by=.lastTimestamp
```

**Likely causes:**
- App exits on bad config, missing env, or failed dependency
- Wrong command/args or working directory
- Probe kills a slow-starting process
- OOM then restart (`Last State: Reason=OOMKilled`)

**Fix direction:**
- Fix app config / secrets; lengthen `startupProbe` if needed
- Raise memory limit only after confirming OOM
- Validate image entrypoint locally with same args

---

### ImagePullBackOff / ErrImagePull

**Symptom:** Container never starts; events show pull failures.

**Investigate:**
```bash
kubectl describe pod <pod> -n <ns>   # Events section
kubectl get secret -n <ns> | grep -iE 'docker|regcred'
# Check image:tag spelling and registry reachability from nodes
```

**Likely causes:**
- Wrong image name/tag or deleted digest
- Private registry without `imagePullSecrets`
- Node cannot reach registry (DNS, proxy, firewall)
- Rate limits on public registries

**Fix direction:**
- Correct image reference; pin digest in prod
- Attach `imagePullSecrets` to ServiceAccount or Pod
- Test pull from a node: `crictl pull <image>`

---

### OOMKilled

**Symptom:** `Last State Reason=OOMKilled`; Exit Code 137.

**Investigate:**
```bash
kubectl describe pod <pod> -n <ns>   # Last State / Limits
kubectl top pod <pod> -n <ns>        # if metrics-server present
# App heap / RSS metrics in APM or sidecar logs
```

**Likely causes:**
- Memory limit too low for workload
- Memory leak or unbounded cache
- Spike under load (batch job, JVM heap > limit)

**Fix direction:**
- Raise limit with headroom; tune JVM `-Xmx` below limit
- Fix leak; add HPA/VPA after baselining
- Separate bursty jobs onto different pods

---

### Liveness / readiness / startup probe failures

**Symptom:** Restarts from liveness; or `Ready 0/1` from readiness.

**Investigate:**
```bash
kubectl describe pod <pod> -n <ns>   # probe failure messages
kubectl logs <pod> -n <ns>
kubectl get endpointslices -n <ns> -l <svc-selector>
```

**Likely causes:**
- Probe path/port wrong; HTTP vs TCP mismatch
- `startupProbe` missing for slow apps
- Readiness too strict → Service has no endpoints
- Dependency not ready at probe time

**Fix direction:**
- Align probe with real health endpoint
- Use `startupProbe`; increase `initialDelay` / `failureThreshold`
- Keep liveness shallow; put deep checks in readiness

---

### Deployment / HPA (Horizontal Pod Autoscaler) not scaling as expected

**Symptom:** Replicas stuck; HPA targets unknown or never scales.

**Investigate:**
```bash
kubectl get deploy,rs,hpa -n <ns>
kubectl describe deploy <name> -n <ns>
kubectl describe hpa <name> -n <ns>
kubectl get --raw /apis/metrics.k8s.io/v1beta1/nodes
```

**Likely causes:**
- metrics-server missing → HPA cannot compute
- Wrong `scaleTargetRef`
- PDB / quota blocking scale-down or scale-up
- Image/config error on new ReplicaSet

**Fix direction:**
- Install/fix metrics-server
- Align HPA target with Deployment name
- Check PDB `minAvailable` vs replica count

---

## Scheduling

### Pod stuck Pending

**Symptom:** Pod never gets a node; Events show `FailedScheduling`.

**Investigate:**
```bash
kubectl describe pod <pod> -n <ns>
kubectl get nodes -o wide
kubectl describe node <node>   # Allocatable vs requests
kubectl get pvc -n <ns>        # if volume claim pending
```

**Likely causes:**
- Insufficient CPU/memory for requests
- NodeSelector / affinity / taints unmatched
- PVC unbound or StorageClass missing
- ResourceQuota / LimitRange blocking create

**Fix direction:**
- Lower requests or scale the node pool
- Relax affinity/tolerations; check taints
- Fix PVC / provisioner before expecting schedule

---

### Node NotReady / pressure

**Symptom:** Node `NotReady`; pods Evicted or Unknown.

**Investigate:**
```bash
kubectl get nodes
kubectl describe node <node>   # Conditions, taints, pressure
kubectl get pods -A -field-selector spec.nodeName=<node>
# Journal / kubelet logs on the node
```

**Likely causes:**
- DiskPressure, MemoryPressure, PIDPressure
- Kubelet / container runtime down
- Network partition to API server
- Kernel / hardware / cloud instance issue

**Fix direction:**
- Free disk (images, logs); cordon & drain safely
- Restart kubelet/runtime; check cloud health
- Scale replacement nodes; delete stuck terminating pods carefully

---

## Network

### Service has no endpoints

**Symptom:** curl to ClusterIP hangs/refuses; Endpoints empty.

**Investigate:**
```bash
kubectl get svc,endpoints,endpointslices -n <ns>
kubectl get pods -n <ns> -l <selector> -o wide
kubectl describe svc <svc> -n <ns>
```

**Likely causes:**
- Label selector mismatch vs pod labels
- Pods not Ready (readiness failing)
- Wrong `targetPort` vs `containerPort`
- NetworkPolicy dropping traffic

**Fix direction:**
- Align labels and `targetPort`
- Fix readiness before expecting traffic
- Audit NetworkPolicies with dry-run tools / logs

---

### DNS resolution failures

**Symptom:** Pods cannot resolve `svc.namespace.svc.cluster.local`.

**Investigate:**
```bash
kubectl -n kube-system get pods -l k8s-app=kube-dns
kubectl -n kube-system logs -l k8s-app=kube-dns
kubectl run -it --rm debug --image=busybox --restart=Never -- \
  nslookup kubernetes.<ns>.svc.cluster.local
# Check /etc/resolv.conf inside failing pod
```

**Likely causes:**
- CoreDNS pods down or misconfigured
- `ndots` / search domain issues
- NetworkPolicy blocking DNS (UDP/TCP 53)
- Node / CNI DNS forwarding broken

**Fix direction:**
- Restore CoreDNS Deployment/ConfigMap
- Allow DNS in NetworkPolicy egress
- Prefer FQDN or tune `dnsConfig.ndots`

---

### NetworkPolicy blocking traffic

**Symptom:** Pods Ready; Service has endpoints; traffic still dropped.

**Investigate:**
```bash
kubectl get networkpolicy -A
kubectl describe networkpolicy <np> -n <ns>
# Compare pod labels to policy podSelector / ingress.from
# CNI-specific policy logs (Calico, Cilium, etc.)
```

**Likely causes:**
- Default-deny with incomplete allow rules
- Missing `namespaceSelector` / `podSelector` match
- Forgot DNS or health-check source
- Policy in wrong namespace

**Fix direction:**
- Add least-privilege allow for required peers/ports
- Test with temporary allow-all then tighten
- Document required flows before locking down

---

## Storage

### PVC Pending / mount failures

PVC - PersistentVolumeClaim — a request for storage that gets bound to a PersistentVolume (PV).

**Symptom:** PVC Pending; pod events: `FailedMount` / timeout.

**Investigate:**
```bash
kubectl get pvc,pv,sc -n <ns>
kubectl describe pvc <pvc> -n <ns>
kubectl describe pod <pod> -n <ns>   # Mount events
# CSI controller / node plugin logs
```

**Likely causes:**
- No matching StorageClass or provisioner down
- Quota / zone / capacity exhausted
- AccessMode mismatch (RWO on multi-attach)
- Node missing CSI driver / IAM permissions

**Fix direction:**
- Fix StorageClass & provisioner health
- Use RWX only when storage supports it
- Ensure CSI DaemonSet on all worker nodes

---

### StatefulSet stuck (ordinal / volume)

**Symptom:** Pod-1 never starts; or volume identity wrong after restore.

**Investigate:**
```bash
kubectl get sts,pods,pvc -n <ns>
kubectl describe sts <name> -n <ns>
kubectl describe pod <name>-0 -n <ns>
```

**Likely causes:**
- Previous ordinal not Ready (`OrderedReady` policy)
- PVC retention / orphaned claims
- Update strategy hung on failing pod
- Headless Service missing for identity

**Fix direction:**
- Fix pod-0 before expecting pod-1
- Use `Parallel` `podManagementPolicy` when safe
- Preserve PVC naming; recreate Service if deleted

---

## Config

### Missing / stale ConfigMap or Secret

**Symptom:** Create fails, or app uses old values after edit.

**Investigate:**
```bash
kubectl get cm,secret -n <ns>
kubectl describe pod <pod> -n <ns>   # Mounted volumes / envFrom
kubectl get deploy <name> -n <ns> -o yaml | grep -A5 env
```

**Likely causes:**
- Referenced name/key does not exist
- `envFrom` with `optional: false` blocks pod start
- ConfigMap update not reloaded (needs restart or reloader)
- Wrong base64 / key in Secret

**Fix direction:**
- Create missing objects; fix key names
- Rollout restart after ConfigMap/Secret change
- Prefer checksum annotation to force rollouts

---

### ResourceQuota / LimitRange rejections

**Symptom:** Create/update denied: exceeded quota or invalid limits.

**Investigate:**
```bash
kubectl get resourcequota,limitrange -n <ns>
kubectl describe resourcequota -n <ns>
# Compare requests/limits on the failing PodSpec
```

**Likely causes:**
- Namespace CPU/memory/object count exhausted
- Container missing required limits (LimitRange)
- Ephemeral-storage quota hit

**Fix direction:**
- Raise quota or reduce requests
- Set compliant requests/limits
- Clean unused pods/jobs/PVCs in namespace

---

## Auth / RBAC

### Forbidden / RBAC denials

RBAC = Role-Based Access Control — who (users/ServiceAccounts) can do which verbs on which API resources.

**Symptom:** API returns Forbidden; operators or apps cannot list/watch.

**Investigate:**
```bash
kubectl auth can-i <verb> <resource> \
  --as=system:serviceaccount:<ns>:<sa> -n <ns>
kubectl get role,rolebinding,clusterrole,clusterrolebinding -A
kubectl describe rolebinding <rb> -n <ns>
# API server audit logs if available
```

**Likely causes:**
- ServiceAccount missing RoleBinding
- Wrong `apiGroup` / resource name in Role
- ClusterRole needed but only Role granted
- Impersonation / kubeconfig user lacks rights

**Fix direction:**
- Grant least privilege for required verbs/resources
- Bind correct SA; avoid default SA in prod
- Verify with `kubectl auth can-i` before redeploy

---

## Control plane

### API server / etcd / control plane unhealthy

**Symptom:** `kubectl` hangs or timeouts; controllers stall.

**Investigate:**
```bash
kubectl get --raw='/readyz?verbose'   # if reachable
# Check apiserver, controller-manager, scheduler, etcd pods/logs
# Cloud control-plane health dashboard / metrics
```

**Likely causes:**
- etcd latency, disk full, or quorum loss
- apiserver cert expiry or misconfig
- Admission webhooks timing out
- Resource exhaustion on control-plane nodes

**Fix direction:**
- Restore etcd health/quorum first
- Rotate certs; scale/fix control plane
- Bypass failing webhooks carefully (`failurePolicy`)

---

### Admission webhook timeouts

**Symptom:** Creates/updates hang or fail: webhook timeout / connection refused.

**Investigate:**
```bash
kubectl get validatingwebhookconfiguration,mutatingwebhookconfiguration
kubectl get pods -A | grep -iE 'webhook|cert-manager|gatekeeper'
# Describe failing object events; check webhook service Endpoints
```

**Likely causes:**
- Webhook pods down or not Ready
- TLS cert mismatch for webhook server
- NetworkPolicy / DNS blocks apiserver → webhook
- `failurePolicy=Fail` with unreachable service

**Fix direction:**
- Restore webhook Deployment & certificates
- Temporarily set `failurePolicy=Ignore` only if safe
- Ensure apiserver can reach webhook Service

---

## Ingress

### Ingress / TLS not serving traffic

**Symptom:** 404/502/SSL errors at edge; backend fine in-cluster.

**Investigate:**
```bash
kubectl get ingress -A
kubectl describe ingress <name> -n <ns>
kubectl get pods -n <ingress-ns>   # controller
kubectl get certificate,secret -n <ns>   # cert-manager
# Controller logs (nginx/traefik/alb)
```

**Likely causes:**
- Ingress class / annotations wrong for controller
- Backend Service/port mismatch
- TLS secret missing or wrong hosts
- cert-manager Challenge stuck (DNS01/HTTP01)

**Fix direction:**
- Match `ingressClassName` to installed controller
- Fix service name/port; verify endpoints
- Repair Certificate / DNS records for ACME

---

## Deep dive: OOMKilled (Out Of Memory + Killed)

**OOMKilled** means the Linux kernel killed the container because it used more memory than its **memory limit**. In Kubernetes you usually see Exit Code **137** (128 + 9 = SIGKILL).

### What happens

1. The pod’s container has a `resources.limits.memory` (e.g. `256Mi`).
2. The container’s memory (RSS + some kernel accounting) climbs past that limit.
3. The **cgroup OOM killer** kills the process immediately — no graceful shutdown.
4. kubelet marks the container **OOMKilled** and, if the restart policy allows, starts it again (often → CrashLoopBackOff).

This is **not** the same as the node running out of memory. Node-level pressure can **evict** pods; OOMKilled is almost always **this container hit its own limit**.

### How to spot it

```bash
kubectl describe pod <pod> -n <ns>
```

Look for:

- `Last State: Terminated` → `Reason: OOMKilled`
- `Exit Code: 137`
- `Limits:` memory value next to the container

```bash
kubectl top pod <pod> -n <ns>   # live usage if metrics-server is up
```

### Common causes

| Cause | Example |
|---|---|
| Limit too low | App needs ~512Mi, limit is 256Mi |
| Memory leak | Usage climbs over hours/days |
| Burst spike | Batch job, large request, cache warm-up |
| JVM mis-tune | Heap (`-Xmx`) ≥ container limit (heap + metaspace + native > limit) |

### What to do

1. Confirm it really is OOM (`describe` + exit 137), not a normal crash.
2. Check real usage (`top`, APM, heap dumps) vs the limit.
3. **Raise the limit** only if the app legitimately needs more; leave headroom (e.g. JVM: `-Xmx` well below the limit).
4. If usage grows without bound → fix the leak, don’t only bump limits.
5. Optionally raise **requests** so the pod isn’t packed onto a tight node (requests affect scheduling; **limits** trigger OOMKilled).

**Rule of thumb:** requests = “what I need scheduled”; limits = “hard ceiling — cross it and you get OOMKilled.”
