# Production Readiness Checklist

Use this after completing all labs. Each item should be doable without Googling.

## Debugging

- [ ] Pod stuck in `Pending` — find scheduler reason in under 2 minutes
- [ ] Pod in `CrashLoopBackOff` — distinguish app crash vs probe failure vs missing ConfigMap key
- [ ] Service returns no traffic — verify endpoints and label selectors match
- [ ] Rollout stuck — read ReplicaSet history and roll back

## Writing manifests

- [ ] Deployment with readiness + liveness probes
- [ ] Resource requests and limits that fit a 2-node cluster
- [ ] nodeSelector or affinity that matches real node labels
- [ ] Toleration that matches a node taint

## Operations

- [ ] `kubectl rollout undo` after a bad deploy
- [ ] Delete a pod and watch the controller recreate it
- [ ] Read events to understand what Kubernetes tried before failing
- [ ] Explain why a PVC in `Pending` blocks pod scheduling

## Networking

- [ ] Trace traffic: Pod → Service → Endpoints → target Pod
- [ ] Identify a NetworkPolicy blocking ingress
- [ ] DNS resolve a service name from inside a pod

## Mindset

- [ ] API accepted my YAML but runtime failed — explain why that is normal
- [ ] Logs looked fine but pod would not start — name three non-log places to look
- [ ] Describe the reconciliation loop for a Deployment

## Stretch goals

- [ ] Cordon and drain a node without dropping baseline `web` traffic
- [ ] Find which deployment is consuming the most memory
- [ ] Fix a broken manifest by reading only `kubectl describe` output
