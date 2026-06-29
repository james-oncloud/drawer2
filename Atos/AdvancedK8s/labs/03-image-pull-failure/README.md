# Lab 03: Image Pull Failure

The image name looks plausible. The API server accepts the manifest. The kubelet fails at runtime.

## Deploy

```bash
./shell/apply-lab.sh 03-image-pull-failure
```

## Debug workflow

```bash
kubectl get pods -n k8s-lab -l app=image-pull-lab
kubectl describe pod -n k8s-lab -l app=image-pull-lab
kubectl get events -n k8s-lab --field-selector involvedObject.kind=Pod
```

## What you should see

`ImagePullBackOff` or `ErrImagePull`. Events reference the registry and tag. Container logs are empty — the image never loaded.

## Fix

Correct the image tag or fix registry credentials.

## Takeaway

Kubernetes validates YAML syntax, not whether your image exists. Runtime failures surface in events and pod status, not at apply time.

## Cleanup

```bash
./shell/cleanup-lab.sh 03-image-pull-failure
```
