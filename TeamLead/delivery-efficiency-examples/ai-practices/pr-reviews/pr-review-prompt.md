# AI-Assisted PR Review Prompt

Paste into Cursor / Copilot / Claude with the PR diff attached.

```
You are reviewing a backend PR for a platform team. Summarize in under 200 words:

1. What changed (user-visible and internal)
2. Risk level: LOW / MEDIUM / HIGH — justify
3. Missing tests or test gaps
4. Architectural concerns (layering, coupling, duplicated logic)
5. Security/performance flags
6. Suggested questions for human reviewers

Assume trunk-based development, mandatory integration tests for I/O,
and golden-path patterns in /docs/golden-paths/.

Do NOT approve or reject — only inform human reviewers.
Focus human attention on domain correctness, architecture, performance, security.
```

## Example AI summary (abbreviated)

**Change:** Adds retry with exponential backoff to `OrderEventsConsumer`.

**Risk:** MEDIUM — consumer lag and duplicate processing possible without idempotency.

**Tests:** Unit tests present; no test for max-retry exhaustion or DLQ handoff.

**Architecture:** Retry logic duplicated from `PaymentEventsConsumer` — consider shared module.

**Human focus:** Confirm idempotency store covers order_id; validate DLQ alert fires at threshold.
