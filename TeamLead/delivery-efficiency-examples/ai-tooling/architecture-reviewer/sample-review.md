# Architecture Review — PR #891 (AI-assisted)

**Service:** order-service  
**Change:** Extract pricing module from monolith

## Findings

| ID | Severity | Finding |
|----|----------|---------|
| AR-1 | HIGH | `pricing` module imports `order.api` — creates cycle with `order-domain` |
| AR-2 | MEDIUM | Duplicate discount calculation in `PricingService` and `LegacyOrderHandler` |
| AR-3 | LOW | Missing `@Timed` on new `/v2/quotes` endpoint |
| AR-4 | INFO | Suggested bounded context: `pricing` as separate deployable in Q3 |

## Recommended actions

1. Invert dependency: `order-domain` defines `PricingPort` interface; `pricing` implements it
2. Delete duplicate logic in `LegacyOrderHandler` after parity test
3. Add observability per golden path before merge

## Human review focus

- Quote API SLA and caching strategy
- Event contract for `order.quote.generated.v1`
