# Lab 01: The Node Selector Trap

The classic six-hour debug. Logs look fine. Manifest looks valid. API server accepted it. Pod never runs.

## Scenario

A teammate retired old GPU nodes and removed their labels. This deployment still targets `disktype=nvme`, which no longer exists on any node.

## Deploy

```bash
./shell/apply-lab.sh 01-node-selector-trap
```

## Your job

Find why the pod is `Pending` without reading the solution.

## Debug workflow

```bash
kubectl get pods -n k8s-lab -l app=node-selector-lab
kubectl describe pod -n k8s-lab -l app=node-selector-lab
kubectl get events -n k8s-lab --sort-by='.lastTimestamp' | tail -20
kubectl get nodes --show-labels
```

## What you should see

Events like:

> `0/3 nodes are available: 3 node(s) didn't match Pod's node affinity/selector`

Logs are empty or unavailable because the container never started. **The failure is in scheduling, not the container.**

## Fix options

1. Remove or correct the `nodeSelector`
2. Label an existing node: `kubectl label node <name> disktype=nvme`
3. Apply the solution: `./shell/apply-solution.sh 01-node-selector-trap`

## Takeaway

`Pending` + empty logs = look at scheduler events first. Node selectors, affinities, and taints live one layer below the pod spec.

## Cleanup

```bash
./shell/cleanup-lab.sh 01-node-selector-trap
```
