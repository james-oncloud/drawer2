# Lab 05: Taints Without Tolerations

A node was dedicated to GPU workloads. It was tainted so only pods with matching tolerations can schedule there. Your deployment has no toleration — and now no node will accept it.

## Deploy

```bash
./shell/apply-lab.sh 05-taints-tolerations
```

The setup script taints one worker node with `dedicated=gpu:NoSchedule`.

## Debug workflow

```bash
kubectl describe pod -n k8s-lab -l app=taint-lab
kubectl describe nodes | grep -A3 Taints
kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints
```

## What you should see

Events: node(s) had untolerated taint(s). Same symptom as node selectors — `Pending`, no container logs.

## Fix options

1. Add a toleration to the pod spec
2. Remove the taint: `kubectl taint nodes <node> dedicated-`
3. Apply the solution

## Takeaway

Taints repel pods. Tolerations allow scheduling onto tainted nodes. They are the inverse of node selectors.

## Cleanup

```bash
./shell/cleanup-lab.sh 05-taints-tolerations
```
