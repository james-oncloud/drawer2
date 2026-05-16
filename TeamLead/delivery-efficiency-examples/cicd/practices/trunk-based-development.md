# Trunk-Based Development — Team Norms

## Rules

- `main` is always deployable
- Short-lived branches (< 2 days), merged via small PRs
- Feature flags for incomplete user-facing work
- No long-lived `develop` or release branches (except hotfix tags)

## Branch naming

```
feature/PAY-1234-idempotency-header
fix/PAY-1290-null-refund-amount
chore/upgrade-spring-3.3
```

## Merge requirements

- Green CI (unit + integration + Sonar + Snyk)
- 1+ human approval (AI summary attached optional)
- No `[WIP]` or draft PRs older than 24h without comment

## Hotfix

1. Branch from `main` tag
2. Fix + test + fast-track review
3. Merge to `main`, deploy, then cherry-pick if parallel release train exists

## Anti-patterns

- PRs open > 1 week
- "Merge Friday" without rollback plan
- Stacking 5 dependent PRs without merge order doc
