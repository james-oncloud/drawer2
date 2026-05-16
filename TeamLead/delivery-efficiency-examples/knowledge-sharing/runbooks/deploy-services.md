# Runbook: Deploy Services

**Owner:** Platform team  
**Last updated:** 2025-04-01

## Standard deployment (GitOps)

1. Merge to `main` — CI must be green
2. Image tag PR auto-created in `platform-deploy`
3. Approve and merge deploy PR
4. Argo CD syncs — watch: https://argocd.example.com/applications

## Verify

```bash
kubectl get pods -n payments -l app=payment-service
curl -s https://payment.internal/actuator/health | jq .status
```

## Rollback

See `architecture/golden-paths/deploy-app.md` — prefer Git revert.

Emergency: `argocd app rollback payment-service`

## Escalation

- #platform-oncall in Slack
- PagerDuty: Platform Engineering

## Common issues

| Symptom | Check |
|---------|-------|
| Sync failed | Argo CD app events, image pull secret |
| CrashLoopBackOff | `kubectl logs`, recent config change |
| 503 after deploy | Canary analysis failed — check error rate panel |
