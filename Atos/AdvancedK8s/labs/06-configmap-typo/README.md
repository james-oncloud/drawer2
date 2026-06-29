# Lab 06: ConfigMap Typo Three Resources Back

The deployment looks fine. The ConfigMap exists. The pod is in `CrashLoopBackOff`.

## Deploy

```bash
./shell/apply-lab.sh 06-configmap-typo
```

## Debug workflow

```bash
kubectl logs -n k8s-lab -l app=configmap-lab --previous
kubectl describe pod -n k8s-lab -l app=configmap-lab
kubectl get configmap app-config -n k8s-lab -o yaml
kubectl get deployment configmap-lab -n k8s-lab -o yaml | grep -A5 env
```

## What you should see

Logs: `FATAL: DATABASE_URL not set`. The ConfigMap has `DATABASE_URL` but the deployment references `DATABSE_URL` (typo).

## Fix

Align the key name in the deployment with the ConfigMap.

## Takeaway

The API server does not validate that ConfigMap keys exist. A typo surfaces as a runtime crash, often several resources away from the mistake.

## Cleanup

```bash
./shell/cleanup-lab.sh 06-configmap-typo
```
