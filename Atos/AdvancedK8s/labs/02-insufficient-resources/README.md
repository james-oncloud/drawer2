# Lab 02: Insufficient Resources

The scheduler cannot place a pod that requests more CPU or memory than any node can provide.

## Deploy

```bash
./shell/apply-lab.sh 02-insufficient-resources
```

## Debug workflow

```bash
kubectl describe pod -n k8s-lab -l app=resource-lab
kubectl describe nodes | grep -A5 "Allocated resources"
kubectl top nodes   # requires metrics-server; optional
```

## What you should see

Events mentioning insufficient `cpu` or `memory`. The pod stays `Pending` forever — Kubernetes will not partially schedule it.

## Fix

Lower `resources.requests` to fit your cluster, or add nodes.

## Takeaway

Requests drive scheduling. Limits drive eviction. A manifest that passes `kubectl apply` can still be unschedulable.

## Cleanup

```bash
./shell/cleanup-lab.sh 02-insufficient-resources
```
