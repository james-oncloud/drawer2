# Lab 04: PVC Waiting for Storage

Copied from a production manifest that used AWS EBS. Your local cluster has no `aws-ebs-gp3` storage class.

## Deploy

```bash
./shell/apply-lab.sh 04-pvc-pending
```

## Debug workflow

```bash
kubectl get pvc -n k8s-lab
kubectl describe pvc data-pvc -n k8s-lab
kubectl describe pod -n k8s-lab -l app=pvc-lab
kubectl get storageclass
```

## What you should see

PVC status `Pending`. Pod events: `unbound PersistentVolumeClaims` or `waiting for volumes`.

## Fix

Use a storage class that exists locally (kind provides `standard`) or remove the volume if not needed.

## Takeaway

Storage is provisioned asynchronously. A pod can be stuck `Pending` because of a PVC three resources away in the same YAML file.

## Cleanup

```bash
./shell/cleanup-lab.sh 04-pvc-pending
```
