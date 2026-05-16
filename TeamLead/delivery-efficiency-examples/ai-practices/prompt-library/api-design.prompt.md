# Prompt: REST API Design

```
Design a REST API for: {{FEATURE_NAME}}

Context:
- Service: {{SERVICE_NAME}}
- Existing OpenAPI base: {{OPENAPI_PATH_OR_URL}}
- Auth: OAuth2 bearer, scopes from {{AUTH_DOC}}

Output:
1. OpenAPI 3.0 YAML snippet (paths, schemas, errors)
2. Idempotency strategy for mutating operations
3. Pagination approach (cursor vs offset) with rationale
4. Standard error envelope matching org pattern:
   { "error": { "code", "message", "request_id", "details" } }
5. Observability: required span attributes and metric names
6. Breaking change assessment if replacing existing endpoints

Constraints:
- Use kebab-case paths, snake_case JSON fields
- Version prefix /v1/
- No breaking changes without ADR reference
```
