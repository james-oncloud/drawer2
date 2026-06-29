# Lab 10: Network Policy Blocking Traffic

Pods can reach each other by IP. DNS resolves. The Service has endpoints. Traffic still fails.

## Deploy

```bash
./shell/apply-lab.sh 10-network-policy
```

## Debug workflow

```bash
kubectl get pods -n k8s-lab -l 'app in (netpol-web,netpol-client)'
kubectl get endpoints netpol-web -n k8s-lab
kubectl describe networkpolicy deny-client-to-web -n k8s-lab

kubectl exec -n k8s-lab deploy/netpol-client -- \
  curl -sS -m 3 http://netpol-web.k8s-lab.svc.cluster.local/ || echo "blocked"
```

## What you should see

Connection times out. The NetworkPolicy only allows ingress from pods labeled `role=trusted-client`. The client has `role=client`.

## Fix

Update the policy to allow the client label, or remove the policy.

## Takeaway

Kubernetes networking defaults to allow-all. NetworkPolicies add deny-by-exception rules. They do not show up in pod events — you have to know to look for them.

## Cleanup

```bash
./shell/cleanup-lab.sh 10-network-policy
```
