# Kubernetes Debugging Cheatsheet

Most debugging happens in `kubectl describe`, not `kubectl logs`.

## First moves for any broken pod

```bash
kubectl get pods -n k8s-lab -o wide
kubectl describe pod <name> -n k8s-lab
kubectl get events -n k8s-lab --sort-by='.lastTimestamp' | tail -30
```

## Symptom → where to look

| Pod status | Likely layer | Commands |
|------------|--------------|----------|
| `Pending` | Scheduler | `describe pod`, `get nodes --show-labels`, check nodeSelector/affinity/taints/resources |
| `ImagePullBackOff` | Registry / image name | `describe pod`, check events |
| `CrashLoopBackOff` | Container or probes | `logs --previous`, `describe pod`, check ConfigMaps/Secrets |
| `Running` but no traffic | Service / NetworkPolicy | `get endpoints`, `describe svc`, `describe networkpolicy` |
| Rollout stuck | Deployment controller | `rollout status`, `describe deployment`, `get rs` |

## Control loop mental model

Every object follows: **desired state → actual state → reconcile**.

```bash
# What you asked for
kubectl get deployment web -n k8s-lab -o yaml

# What exists
kubectl get pods -n k8s-lab -l app=web

# What the controller tried
kubectl describe deployment web -n k8s-lab
kubectl get events -n k8s-lab
```

## Scheduling traps

```bash
kubectl get nodes -L lab-zone,disktype,node-role
kubectl describe nodes | grep -E 'Taints|Labels' -A2
kubectl describe pod <name> -n k8s-lab | grep -A10 Events
```

## Networking traps

```bash
kubectl get svc,endpoints -n k8s-lab
kubectl get networkpolicy -n k8s-lab
kubectl run curl --rm -it --restart=Never -n k8s-lab --image=curlimages/curl -- \
  curl -v http://<service>.<namespace>.svc.cluster.local/
```

## Storage traps

```bash
kubectl get pvc -n k8s-lab
kubectl describe pvc <name> -n k8s-lab
kubectl get storageclass
```

## Rollback

```bash
kubectl rollout history deployment/<name> -n k8s-lab
kubectl rollout undo deployment/<name> -n k8s-lab
kubectl rollout status deployment/<name> -n k8s-lab
```

## Resource pressure

```bash
kubectl describe nodes | grep -A6 "Allocated resources"
kubectl top nodes    # needs metrics-server
kubectl top pods -n k8s-lab
```
