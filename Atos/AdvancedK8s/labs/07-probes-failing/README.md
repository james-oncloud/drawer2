# Lab 07: Liveness Probe Killing a Healthy Container

Nginx is running. The liveness probe checks `/healthz`, which nginx does not serve. Kubernetes keeps restarting a healthy process.

## Deploy

```bash
./shell/apply-lab.sh 07-probes-failing
```

## Debug workflow

```bash
kubectl get pods -n k8s-lab -l app=probe-lab
kubectl describe pod -n k8s-lab -l app=probe-lab
kubectl logs -n k8s-lab -l app=probe-lab --previous
```

## What you should see

`CrashLoopBackOff` with events: `Liveness probe failed: HTTP probe failed with statuscode: 404`. Logs from the previous container may look normal.

## Fix

Point the probe at `/` or add a real health endpoint.

## Takeaway

CrashLoopBackOff does not always mean the app crashed. Probes can kill containers that are otherwise healthy.

## Cleanup

```bash
./shell/cleanup-lab.sh 07-probes-failing
```
