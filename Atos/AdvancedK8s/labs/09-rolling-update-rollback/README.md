# Lab 09: Rolling Update and Rollback

Practice the control loop: desired state changes, controller reconciles, rollout can stall when new pods never become ready.

## Deploy

```bash
./shell/apply-lab.sh 09-rolling-update-rollback
```

This applies healthy v1, waits for rollout, then applies broken v2.

## Debug workflow

```bash
kubectl rollout status deployment/rollout-lab -n k8s-lab
kubectl get pods -n k8s-lab -l app=rollout-lab -o wide
kubectl describe deployment rollout-lab -n k8s-lab
kubectl rollout history deployment/rollout-lab -n k8s-lab
```

## What you should see

Old replicas still serving. New replicas `ImagePullBackOff`. Rollout stuck because `maxUnavailable: 0` keeps old pods until new ones are ready.

## Fix — rollback

```bash
kubectl rollout undo deployment/rollout-lab -n k8s-lab
kubectl rollout status deployment/rollout-lab -n k8s-lab
```

## Takeaway

Deployments are controllers. They preserve availability during rollouts. `kubectl rollout undo` is your escape hatch when a release is broken.

## Cleanup

```bash
./shell/cleanup-lab.sh 09-rolling-update-rollback
```
