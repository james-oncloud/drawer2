# Golden Path: Deploy an Application

## Standard flow (GitOps)

1. Merge PR to `main` → CI builds image `registry/org/service:sha-abc123`
2. Platform bot opens PR to `platform-deploy` updating image tag
3. Argo CD syncs staging automatically
4. Smoke tests pass → promote to prod via canary (Argo Rollouts)

## Rollback

```bash
# Preferred: revert Git commit in platform-deploy
git revert <commit> && git push

# Emergency: Argo CD rollback to previous revision
argocd app rollback payment-service <revision>
```

## Preview environments (PR)

- Label PR with `deploy-preview`
- URL: `https://pr-<number>.preview.example.com`
- TTL: 48h auto-teardown

## Not allowed

- Manual `kubectl set image` in production
- SSH deploys
- Config changes only in cluster (must be in Git)
