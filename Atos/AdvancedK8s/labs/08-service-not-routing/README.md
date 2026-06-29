# Lab 08: Service Not Routing Traffic

Pods are running. The Service exists. `curl` returns connection refused or hangs.

## Deploy

```bash
./shell/apply-lab.sh 08-service-not-routing
```

## Debug workflow

```bash
kubectl get pods -n k8s-lab -l app=routing-lab
kubectl get endpoints routing-lab -n k8s-lab
kubectl describe svc routing-lab -n k8s-lab
kubectl run curl --rm -it --restart=Never -n k8s-lab --image=curlimages/curl -- \
  curl -sS -m 3 http://routing-lab.k8s-lab.svc.cluster.local/ || true
```

## What you should see

Endpoints: `<none>`. Service selector is `app=routing-lab-svc` but pods are labeled `app=routing-lab`.

## Fix

Align Service `selector` labels with pod template labels.

## Takeaway

Services route by label selector, not by name. A one-character label mismatch means zero endpoints and no traffic.

## Cleanup

```bash
./shell/cleanup-lab.sh 08-service-not-routing
```
