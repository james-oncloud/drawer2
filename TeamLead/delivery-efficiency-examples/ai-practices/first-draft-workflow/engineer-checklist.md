# AI First Draft — Engineer Checklist

Use this before opening a PR for any feature or bugfix.

## Before coding

- [ ] Ticket has acceptance criteria and scope boundaries
- [ ] Relevant ADRs / golden-path docs reviewed
- [ ] AI prompt selected from `../prompt-library/` (or custom prompt with context)

## First draft (AI-assisted)

- [ ] AI generated initial implementation against acceptance criteria
- [ ] You read every changed line — no blind accept
- [ ] Security-sensitive paths (auth, PII, payments) manually verified
- [ ] Naming and patterns match existing codebase conventions

## Before merge

- [ ] Unit tests added or updated
- [ ] Integration test added if touching external systems (DB, Kafka, HTTP)
- [ ] Manual smoke test in local/ephemeral environment
- [ ] PR description includes what AI generated vs what you changed

## Red flags — stop and refactor manually

- Hallucinated APIs or dependencies
- Over-abstraction for one-off logic
- Missing error handling or idempotency on consumers
- Tests that mock everything and assert nothing
