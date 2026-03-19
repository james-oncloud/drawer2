# Microservices Design Patterns

This file lists commonly used design patterns for microservices-based systems.

## 1) Decomposition and architecture patterns

- **Decompose by business capability**: split services around business domains.
- **Decompose by subdomain (DDD)**: align services with bounded contexts.
- **Strangler Fig pattern**: incrementally replace parts of a monolith with services.
- **API Gateway**: single entry point for routing, auth, rate limiting, and aggregation.
- **Backend for Frontend (BFF)**: dedicated backend per client type (web, mobile, etc.).

## 2) Data management patterns

- **Database per service**: each service owns its data store.
- **Shared database (anti-pattern in most cases)**: multiple services access same DB directly.
- **Saga pattern**: distributed transaction management with local transactions + compensations.
- **Saga choreography**: services react to domain events without central coordinator.
- **Saga orchestration**: a central orchestrator coordinates saga steps and compensations.
- **Transactional Outbox**: atomically save business data and event record, then publish safely.
- **CQRS (Command Query Responsibility Segregation)**: separate write and read models.
- **Event Sourcing**: store state changes as events instead of only current state.
- **Materialized View / Read Model**: precomputed views optimized for query workloads.

## 3) Communication and integration patterns

- **Request/Response (sync HTTP/gRPC)**: direct service calls for immediate responses.
- **Asynchronous messaging**: event-driven communication through brokers/queues.
- **Publish/Subscribe**: services publish events; subscribers react independently.
- **Event-Carried State Transfer**: events include enough state to reduce coupling.
- **Idempotent Consumer**: safely handle duplicate messages.
- **Event Notification**: publish minimal change signal; consumers fetch details if needed.

## 4) Reliability and resilience patterns

- **Circuit Breaker**: stop calling unhealthy downstream services temporarily.
- **Retry with backoff**: retry transient failures with delay/jitter.
- **Timeout**: bound wait time for remote dependencies.
- **Bulkhead**: isolate resource pools to prevent cascading failures.
- **Fallback**: degrade gracefully when dependency fails.
- **Rate Limiting**: protect services from overload.
- **Dead Letter Queue (DLQ)**: store unprocessable messages for later handling.
- **Health Check (liveness/readiness/startup)**: expose service health for orchestration.

## 5) Deployment and runtime patterns

- **Sidecar**: attach helper process/container (proxy, logging, security) per service.
- **Service Discovery**: dynamic lookup of service instances.
- **Service Registry**: central registry for discoverable instances.
- **Blue-Green Deployment**: two environments; switch traffic after validation.
- **Canary Release**: gradually route small traffic percentage to new version.
- **Feature Toggle**: enable/disable features at runtime without redeploy.
- **Externalized Configuration**: config outside service binaries/images.

## 6) Security patterns

- **OAuth 2.0 / OpenID Connect**: delegated auth and identity federation.
- **JWT propagation**: pass user/service identity across service boundaries.
- **mTLS between services**: mutual authentication and encrypted service-to-service traffic.
- **Policy Enforcement Point**: central or sidecar-based authorization checks.
- **Secrets management**: vault-backed dynamic/rotated credentials.

## 7) Observability and operations patterns

- **Distributed Tracing**: track request path across services.
- **Correlation ID propagation**: connect logs/metrics/traces for a request.
- **Centralized Logging**: aggregate logs into searchable platform.
- **Metrics + SLOs**: measure reliability and alert from objective targets.
- **Audit Logging**: immutable record of sensitive/critical actions.

## Quick selection guide

- Use **API Gateway + BFF** when clients have different payload/latency needs.
- Use **Database per service + Saga + Outbox** to keep service autonomy and data consistency.
- Use **Async messaging + Idempotent Consumer + DLQ** for robust event processing.
- Use **Circuit Breaker + Timeout + Retry + Bulkhead** for resilience.
- Use **Canary/Blue-Green + Feature Toggles** for safer releases.
