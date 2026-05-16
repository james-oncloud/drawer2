# Prompt: Architecture Review

```
Review architecture for: {{SYSTEM_OR_CHANGE_DESCRIPTION}}

Artifacts attached: ADRs, diagrams, package structure, dependency graph.

Evaluate:
1. Cyclic dependencies (module and package level)
2. Layering violations (domain → infra direction)
3. Duplicated logic across services
4. Modularity and bounded context fit
5. Failure modes: cascading outages, retry storms, split brain
6. Observability: metrics, logs, traces sufficient for SLOs
7. Security boundaries and data classification
8. Migration/rollback strategy

Output:
- Findings ranked CRITICAL / HIGH / MEDIUM / LOW
- Concrete refactor suggestions (max 5)
- Questions for design review meeting
```
