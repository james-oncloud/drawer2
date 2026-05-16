# Golden Path: Database Migrations

## Tooling

- Flyway or Liquibase in dedicated `*-migrations` repo (not in app repo)
- One migration per PR when possible

## Rules

- Backward-compatible expands only in single deploy (add column nullable first)
- No destructive changes without two-phase deploy + ADR
- Never edit applied migration files

## Example expand-contract

**Phase 1 (deploy N):** Add `status_v2` column, nullable, backfill via job  
**Phase 2 (deploy N+1):** Switch app reads to `status_v2`  
**Phase 3 (deploy N+2):** Drop `status` column

## Review

- DBA review for indexes > 1M rows
- Estimate lock time on large tables
