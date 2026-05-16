# Golden Path: Create a New Service

Approved path — follow these steps; do not invent alternate stacks without ADR.

## 1. Scaffold

```bash
./platform-cli create-service --name order-service --owner fulfillment-team
```

Uses template: `architecture/platform/service-template/`

## 2. Register

- Add `catalog-info.yaml` to Backstage
- Request Kafka topic via `#platform-requests` (standard naming: `domain.entity.event.v1`)
- DB: use shared RDS pattern — ticket for schema + migrations repo

## 3. CI/CD

- Enable shared pipeline from `architecture/platform/shared-ci/`
- Argo CD app under `environments/{staging,prod}/order-service`

## 4. Observability (required before prod)

- OpenTelemetry agent enabled
- Dashboard from Grafana folder `Platform/Services`
- Alerts: error rate, latency p99, consumer lag (if Kafka)

## 5. Auth

- Use platform OAuth2 resource server config
- Scopes defined in `auth/scopes.yaml` — do not roll custom JWT validation

## 6. First deploy checklist

- [ ] Integration tests green in CI
- [ ] Runbook linked in Backstage
- [ ] On-call rotation updated in PagerDuty
