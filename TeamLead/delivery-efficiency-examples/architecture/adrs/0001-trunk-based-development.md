# ADR-0001: Adopt Trunk-Based Development

- **Status:** Accepted
- **Date:** 2025-03-01
- **Deciders:** Platform team, engineering leads

## Context

Long-lived feature branches caused merge pain, stale PRs, and unpredictable releases. Teams waited weeks to integrate. CI feedback was slow on large diffs.

## Decision

All product teams adopt trunk-based development on `main`:

- Short-lived branches (< 2 days)
- Feature flags for incomplete work
- PR size guideline < 400 lines
- Shared CI gates (tests, Sonar, Snyk)

## Consequences

### Positive

- Faster integration and deployment frequency
- Smaller, reviewable PRs
- Reduced merge conflict cost

### Negative

- Upfront investment in feature-flag infrastructure
- Discipline required — coaches needed during transition

## Alternatives considered

| Option | Pros | Cons |
|--------|------|------|
| GitFlow | Familiar | Slow integration, release overhead |
| Trunk-based | Fast feedback | Requires flags and CI maturity |

## References

- `cicd/practices/trunk-based-development.md`
- DORA research on branch lifetime vs lead time
