# Advanced Kubernetes — Learn by Breaking Things

Hands-on labs for the failure modes that separate average from expert engineers. Each lab deploys a **broken but valid** manifest. Your job is to find the real problem — usually one or two abstractions away from where you first look.

## Prerequisites

- Docker Desktop (or Docker Engine) running
- [kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation)
- `kubectl`

```bash
# macOS
brew install kind kubectl
```

## Quick start

```bash
cd Atos/AdvancedK8s
chmod +x shell/*.sh labs/*/setup.sh labs/*/teardown.sh
./shell/fireup.sh
```

This creates a 3-node kind cluster and a working baseline deployment in `k8s-lab` namespace.

## How to use the labs

1. Read the lab README
2. Deploy the broken scenario: `./shell/apply-lab.sh <lab-name>`
3. Debug using events and describe — not just logs
4. Fix it yourself, or peek: `./shell/apply-solution.sh <lab-name>`
5. Clean up: `./shell/cleanup-lab.sh <lab-name>`

```bash
./shell/apply-lab.sh 01-node-selector-trap
cat labs/01-node-selector-trap/README.md
# ... debug ...
./shell/cleanup-lab.sh 01-node-selector-trap
```

## Learning path

Work through labs in order. Each focuses on one failure mode.

| Lab | Failure mode | Symptom |
|-----|--------------|---------|
| [01-node-selector-trap](labs/01-node-selector-trap/) | Node selector points to missing label | `Pending` |
| [02-insufficient-resources](labs/02-insufficient-resources/) | Requests exceed node capacity | `Pending` |
| [03-image-pull-failure](labs/03-image-pull-failure/) | Bad image tag | `ImagePullBackOff` |
| [04-pvc-pending](labs/04-pvc-pending/) | Storage class does not exist | `Pending` (PVC unbound) |
| [05-taints-tolerations](labs/05-taints-tolerations/) | Tainted node, no toleration | `Pending` |
| [06-configmap-typo](labs/06-configmap-typo/) | Wrong ConfigMap key name | `CrashLoopBackOff` |
| [07-probes-failing](labs/07-probes-failing/) | Liveness probe on wrong path | `CrashLoopBackOff` |
| [08-service-not-routing](labs/08-service-not-routing/) | Service selector mismatch | No endpoints |
| [09-rolling-update-rollback](labs/09-rolling-update-rollback/) | Bad rollout, image fails | Rollout stuck |
| [10-network-policy](labs/10-network-policy/) | NetworkPolicy blocks traffic | Timeout |

## Reference material

- [debug-cheatsheet.md](debug-cheatsheet.md) — symptom → command mapping
- [exercises/checklist.md](exercises/checklist.md) — production readiness self-test
- [baseline/](baseline/) — working Deployment with probes and resource limits

## Baseline deployment

The `baseline/` manifests show a production-shaped Deployment:

- Readiness and liveness probes
- Resource requests and limits
- ConfigMap-backed environment
- Rolling update strategy

Study these before writing your own manifests. Compare each broken lab against this baseline.

## Control loop exercises

After the labs, practice the reconciliation pattern:

```bash
# Delete a pod — Deployment recreates it
kubectl delete pod -n k8s-lab -l app=web --force --grace-period=0

# Scale up — controller adds replicas
kubectl scale deployment web -n k8s-lab --replicas=4
kubectl get pods -n k8s-lab -w

# Break and fix the baseline on purpose
kubectl edit deployment web -n k8s-lab
```

## Cluster layout

```
kind cluster: advanced-k8s
├── control-plane   (lab-zone=east)
├── worker          (lab-zone=west, disktype=hdd)
└── worker          (lab-zone=west, disktype=ssd)
```

## Teardown

```bash
./shell/shutdown.sh
```

## Philosophy

- **Read events, not just logs.** Scheduling failures never reach the container.
- **Write raw YAML.** No Helm, no `kubectl run`. Version control your manifests.
- **Break one thing at a time.** Each lab isolates a single trap.
- **The API lies by omission.** Valid YAML is not valid operations.

The node selector trap from the article is Lab 01. Start there.
