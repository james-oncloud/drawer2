# Example: AI-Assisted Framework Migration

**Task:** Spring Boot 3.2 → 3.3 across payment-service

## Prompt

```
Plan and execute Spring Boot 3.3 upgrade for this Gradle project.
List breaking changes from release notes affecting our dependencies.
Update build.gradle, fix deprecations, run tests.
Flag manual follow-ups.
```

## AI deliverables

1. Dependency version bump table
2. `javax.*` → `jakarta.*` import fixes (if any remain)
3. Config property renames in `application.yml`
4. Updated test mocks for changed APIs

## Engineer verification

- [ ] `./gradlew test integrationTest` green
- [ ] Staging deploy smoke test
- [ ] ADR or changelog entry if behavior change
- [ ] Rollback tag noted before prod

## Outcome template

| Step | AI | Human |
|------|-----|-------|
| Dependency scan | ✓ | Verify internal libs compatible |
| Code fixes | ✓ | Review security-sensitive paths |
| Test fixes | ✓ | Add missing integration coverage |
| Deploy | — | Own release and monitor |
