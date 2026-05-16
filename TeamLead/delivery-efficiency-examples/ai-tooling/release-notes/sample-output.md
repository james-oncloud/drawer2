# Release v2.14.0 — payment-service

**Date:** 2025-04-10  
**Previous:** v2.13.2

## Summary

Adds refund idempotency and improves Kafka consumer retry handling. No breaking API changes. Requires Redis TTL config in staging/prod before deploy.

## Changes

### Features

- Idempotency-Key header on `POST /v1/refunds` (PAY-1842)
- Shared retry library for event consumers (PLAT-88)

### Fixes

- Null amount validation on partial refunds (PAY-1810)

### Internal

- Spring Boot 3.3.2 patch upgrade

## API changes

None breaking. New optional header: `Idempotency-Key`.

## Migrations

None. Config only:

```yaml
refund.idempotency.ttl-hours: 24
```

## Risk analysis

| Area | Risk | Mitigation |
|------|------|------------|
| Redis dependency | Medium if Redis down | Existing circuit breaker; monitor connection errors |
| Consumer replay | Low | Idempotency store prevents duplicate refunds |

## Rollback

Revert deploy PR #4521 in `platform-deploy` or `argocd app rollback payment-service`.
