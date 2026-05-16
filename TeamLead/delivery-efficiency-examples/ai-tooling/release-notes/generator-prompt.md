# AI Release Notes Generator — Prompt

```
Generate release notes for version {{VERSION}} from:
- Merged PRs since tag {{PREVIOUS_TAG}}
- OpenAPI diff (if any)
- Database migration files
- Feature flag changes

Output:

## Summary
(2-3 sentences for stakeholders)

## Changes
### Features
### Fixes
### Internal / platform

## API changes
(breaking changes highlighted)

## Migrations
(steps operators must run)

## Risk analysis
| Area | Risk | Mitigation |
|------|------|------------|

## Rollback
(specific commands or "revert deploy PR #NNN")
```
