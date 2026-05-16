# Prompt: New Spring Boot Service

```
Scaffold a Spring Boot 3 service from platform template.

Service name: {{SERVICE_NAME}}
Domain: {{DOMAIN}}
Port: {{PORT}}

Include:
- Spring Web, Actuator, Validation
- OpenTelemetry Java agent config
- Structured JSON logging (trace_id, span_id)
- Health: liveness /readiness, readiness checks DB + Kafka if used
- Dockerfile multi-stage build
- application.yml with profiles: local, staging, prod
- Example unit + @SpringBootTest smoke test
- catalog-info.yaml stub for Backstage

Do not add business logic — only golden-path skeleton.
Reference: architecture/platform/service-template/
```
