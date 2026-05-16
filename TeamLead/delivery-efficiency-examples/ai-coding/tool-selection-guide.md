# AI Coding Assistants — When to Use Which

| Tool | Strength | Example use |
|------|----------|-------------|
| Cursor | Large repo navigation, multi-file refactor | Rename across services, generate tests |
| GitHub Copilot | Inline completion, PR integration | Boilerplate in IDE, quick snippets |
| Claude Code | Architecture reasoning, long-context debug | ADR drafts, incident log analysis |
| Codex CLI | Terminal automation | Scaffold scripts, batch migrations |
| Sourcegraph Cody | Cross-repo enterprise search | "Where is idempotency implemented org-wide?" |

## High-value use cases (from team playbook)

- Boilerplate generation → then human review
- Legacy refactor with characterization tests first
- Unit/integration test generation
- PR review summaries (see `ai-practices/pr-reviews/`)
- API docs from OpenAPI / code
- Framework migrations (e.g. Java 17 → 21)
- Terraform/K8s manifest drafts
- Incident root-cause hypothesis (with human verification)

## Not a substitute for

- Production access decisions
- Security sign-off
- Domain/product tradeoffs
- Performance testing on critical paths
