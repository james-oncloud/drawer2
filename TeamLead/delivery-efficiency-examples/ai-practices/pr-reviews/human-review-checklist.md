# Human PR Review Checklist

AI handles: summary, missing tests, obvious violations, risky diffs.

Humans own:

## Domain correctness

- [ ] Business rules match ticket and product spec
- [ ] Edge cases: nulls, duplicates, partial failures, timeouts
- [ ] Backward compatibility for API/event contracts

## Architecture

- [ ] Fits golden path (service template, Kafka pattern, observability)
- [ ] No new cyclic dependencies or inappropriate cross-service calls
- [ ] Shared logic in platform libs, not copy-pasted

## Performance

- [ ] No N+1 queries or unbounded in-memory collections
- [ ] Appropriate connection pool / batch sizes for Kafka consumers
- [ ] Caching justified and invalidated correctly

## Security

- [ ] AuthZ on new endpoints; no secrets in logs or config commits
- [ ] Input validation and safe defaults
- [ ] Dependency scan clean (Snyk/Sonar gate)

## Process

- [ ] PR under ~400 lines or split with clear dependency order
- [ ] Rollback path documented if feature-flagged or schema change
