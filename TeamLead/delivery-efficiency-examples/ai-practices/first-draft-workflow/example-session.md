# Example: AI First Draft Session

**Ticket:** PAY-1842 — Add idempotency key header to refund endpoint

## Prompt used

```
Implement idempotency for POST /v1/refunds using header Idempotency-Key.
Store keys in Redis with 24h TTL. Return 409 if key reused with different body.
Match patterns in payment-service/RefundController and existing IdempotencyFilter.
Include unit tests and one Testcontainers integration test.
```

## AI output (summary)

- `RefundController` — reads header, delegates to service
- `IdempotencyService` — Redis lookup/store
- `RefundControllerTest`, `IdempotencyIntegrationTest`

## Engineer changes after review

| Change | Reason |
|--------|--------|
| TTL configurable via `application.yml` | Ops requirement for env-specific retention |
| 409 response includes `original_request_id` | Support tooling needs traceability |
| Integration test uses unique key per run | Flaky test in CI without isolation |

## Time saved

~2h boilerplate → ~45m review + tests + edge cases
