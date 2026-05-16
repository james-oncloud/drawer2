# Prompt: Test Generation

```
Generate tests for: {{CLASS_OR_FILE_PATH}}

Framework: JUnit 5, Mockito, AssertJ, Testcontainers where I/O exists

Cover:
- Happy path
- Validation failures (400)
- Not found (404)
- Conflict/idempotency (409)
- Downstream timeout/retry behavior
- Property: {{BUSINESS_INVARIANT}}

Rules:
- No test-only production code
- Use builders/factories consistent with existing tests in {{TEST_PACKAGE}}
- Integration tests: @Testcontainers, one container per class
- Name tests: should_ExpectedBehavior_When_Condition

Output only test classes; list any missing seams for testability.
```
