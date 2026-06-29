# How Liquibase Works

Liquibase is a database schema migration tool. Instead of applying SQL scripts by hand or keeping schema in sync manually, you define **changes** in version-controlled files. Liquibase tracks what has already run and applies only the new changes to each database.

---

## The Problem It Solves

Without a migration tool:

- Developers run different SQL on dev, staging, and production
- Nobody knows which scripts have been applied to which environment
- Rolling back or reproducing a schema state is error-prone

Liquibase treats the database schema like application code: declarative, ordered, and auditable.

---

## Core Concepts

### Changelog

A **changelog** is the master file that lists all migrations. It can include other changelogs, forming a tree. Liquibase starts here and walks through every changeset in order.

Example (`db.changelog-master.yaml`):

```yaml
databaseChangeLog:
  - include:
      file: db/changelog/001-create-users.sql
  - include:
      file: db/changelog/002-add-email-index.yaml
```

### Changeset

A **changeset** is one atomic unit of change. Each changeset has a unique identity:

- **id** — logical name (e.g. `create-users-table`)
- **author** — who wrote it (e.g. `jking`)
- **filename** — the file it lives in (added automatically)

Liquibase records executed changesets in a tracking table. The same changeset is never applied twice to the same database.

### DATABASECHANGELOG

Liquibase creates and maintains metadata tables (by default `DATABASECHANGELOG` and `DATABASECHANGELOGLOCK`). After each successful changeset, it inserts a row with:

- changeset id, author, filename
- checksum (to detect if someone edited an already-applied migration)
- execution date and order

On the next run, Liquibase compares the changelog to this table and runs only what is missing.

### DATABASECHANGELOGLOCK

A simple lock table prevents two Liquibase processes from migrating the same database at the same time.

---

## Execution Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Changelog      │────▶│  Liquibase       │────▶│  Target DB      │
│  (YAML/XML/SQL) │     │  (CLI / Maven /  │     │  (Postgres,     │
│                 │     │   Spring Boot)   │     │   MySQL, etc.)  │
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ DATABASECHANGELOG│
                        │ (what ran already)│
                        └──────────────────┘
```

1. Connect to the database using a JDBC URL and credentials.
2. Ensure tracking tables exist (create if needed).
3. Acquire the changelog lock.
4. Read the master changelog and resolve all included files.
5. For each changeset: if not in `DATABASECHANGELOG`, execute it and record the result.
6. Release the lock.

If a changeset fails, Liquibase stops and leaves earlier changesets committed. You fix the problem and run again; already-applied changesets are skipped.

---

## Changelog Formats

Liquibase supports several formats; all compile to the same internal model:

| Format | Typical use |
|--------|-------------|
| **YAML** | Readable, popular for greenfield projects |
| **XML** | Older projects, explicit structure |
| **JSON** | Tooling-friendly |
| **SQL** | Raw SQL with Liquibase header comments |
| **Formatted SQL** | `.sql` files with `-- changeset author:id` markers |

### YAML changeset example

```yaml
databaseChangeLog:
  - changeSet:
      id: create-users-table
      author: jking
      changes:
        - createTable:
            tableName: users
            columns:
              - column:
                  name: id
                  type: BIGINT
                  autoIncrement: true
                  constraints:
                    primaryKey: true
              - column:
                  name: email
                  type: VARCHAR(255)
                  constraints:
                    nullable: false
```

### Formatted SQL example

```sql
-- liquibase formatted sql

-- changeset jking:create-users-table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL
);
```

Liquibase abstracts some differences between databases (e.g. `autoIncrement` vs `SERIAL`), though complex SQL may still need database-specific changesets.

---

## Running Liquibase

### CLI

```bash
liquibase update \
  --changelog-file=db/changelog/db.changelog-master.yaml \
  --url=jdbc:postgresql://localhost:5432/mydb \
  --username=app \
  --password=secret
```

### Common commands

| Command | Purpose |
|---------|---------|
| `update` | Apply all pending changesets |
| `status` | List pending changesets without applying |
| `rollback-count N` | Undo the last N changesets (if rollback is defined) |
| `rollback-to-date` | Roll back to a point in time |
| `diff` | Compare two databases or a DB vs changelog |
| `validate` | Check changelog syntax and checksums |
| `clear-checksums` | Recalculate checksums after intentional edits (use carefully) |

### Integration options

- **Maven / Gradle plugin** — run migrations in CI or as part of the build
- **Spring Boot** — `spring.liquibase.change-log` runs on application startup
- **CI/CD** — dedicated migration step before or during deploy

---

## Features Worth Knowing

### Rollback

Changesets can define how to undo a change:

```yaml
- changeSet:
    id: add-status-column
    author: jking
    changes:
      - addColumn:
          tableName: orders
          columns:
            - column:
                name: status
                type: VARCHAR(32)
    rollback:
      - dropColumn:
          tableName: orders
          columnName: status
```

Not every change has a safe automatic rollback (e.g. dropping a column with data). Production rollbacks often use forward-fix migrations instead.

### Contexts and labels

- **Contexts** — run changesets only in matching environments (e.g. `context: dev` for seed data).
- **Labels** — tag changesets for selective runs (e.g. `labels: v2.1`).

### Preconditions

Check state before applying a changeset (table exists, DB type is PostgreSQL, etc.) to avoid failures or to skip work when already done.

### Changeset attributes

- `runOnChange: true` — re-run when the changeset definition changes (useful for views/procedures).
- `runAlways: true` — run every time (rare; e.g. grants).
- `failOnError: false` — continue on failure (use sparingly).

---

## Rules of Thumb

These align with common team practice (including expand–contract migrations):

1. **Never edit a changeset that has already been applied** in any shared environment. Liquibase checksums will fail, or worse, environments will diverge. Add a new changeset instead.
2. **One logical change per changeset** — easier to review, debug, and roll back.
3. **Keep migrations in a dedicated repo or module** when possible, separate from application code.
4. **Prefer backward-compatible changes** in a single deploy (add nullable column first, backfill, then enforce).
5. **Destructive changes** (drop column, change type) often need a multi-phase deploy and an ADR.
6. **Test migrations** against a copy of production-like data before release.

---

## Liquibase vs Flyway (brief)

Both solve schema versioning. Liquibase tends toward **declarative** changes (createTable, addColumn) and built-in rollback; Flyway is often **SQL-first** with simpler versioning (`V1__`, `V2__`). Teams pick one per organization and stick to it.

---

## Minimal Project Layout

```
Liquibase/
├── liquibase.properties      # default URL, changelog path
├── db/
│   └── changelog/
│       ├── db.changelog-master.yaml
│       ├── 001-initial-schema.sql
│       └── 002-add-indexes.yaml
└── notes.md                  # this file
```

`liquibase.properties` example:

```properties
changelog-file=db/changelog/db.changelog-master.yaml
url=jdbc:postgresql://localhost:5432/mydb
username=app
password=secret
```

Then: `liquibase update` from the project root.

---

## Summary

Liquibase reads an ordered changelog, compares it to what is recorded in `DATABASECHANGELOG`, and applies only pending changesets. That gives you repeatable, environment-consistent schema evolution with a clear audit trail of who changed what and when.
