# Spring Boot Modules Used in RESTful API Microservices

This document lists the main Spring Boot modules and starter dependencies commonly used when building RESTful API microservices.

Not every microservice uses all of these modules. A typical service picks a small set based on its responsibilities, such as web, security, persistence, messaging, and observability.

## Key Concepts Review

- **Spring Boot starters** are the main "modules" most teams talk about in real projects because they bundle the libraries needed for a capability.
- **REST API microservices** usually need a small core set first: web, validation, actuator, and test support.
- **Data access, security, messaging, and cloud integration** are added only when the service actually needs them.
- **Spring Cloud modules** are often used with Spring Boot microservices, but they are separate from the core Spring Boot project.
- **A good microservice keeps its dependency list small** so startup, maintenance, and security patching stay manageable.

---

## 1) Core Spring Boot Modules for REST APIs

These are the most common modules for a standard RESTful microservice.

### `spring-boot-starter`
- Core Boot support
- Auto-configuration support
- Logging support
- Basic utility dependencies

This is the base starter behind many other starters.

### `spring-boot-starter-web`
- Spring MVC
- Embedded Tomcat
- Jackson JSON serialization/deserialization
- REST controller support with `@RestController`
- Request mapping with `@GetMapping`, `@PostMapping`, and related annotations

Use this for traditional synchronous REST APIs.

### `spring-boot-starter-validation`
- Bean Validation support
- `@Valid`, `@Validated`
- Validation annotations like `@NotNull`, `@Size`, `@Email`

This is commonly used for validating request DTOs in REST endpoints.

### `spring-boot-starter-actuator`
- Health checks
- Metrics
- Info endpoint
- Readiness/liveness support
- Operational endpoints under `/actuator`

This is very common in microservices for monitoring and deployment health.

### `spring-boot-starter-test`
- JUnit
- Mockito
- Spring Test
- JSON testing utilities
- Mock MVC/Web testing support

This is the default testing starter for Spring Boot applications.

---

## 2) Web and Reactive API Options

Choose one main web stack depending on the style of API you are building.

### `spring-boot-starter-web`
- Best for blocking, servlet-based applications
- Uses Spring MVC
- Best fit for many CRUD-style REST APIs

### `spring-boot-starter-webflux`
- Reactive, non-blocking web stack
- Uses Reactor `Mono` and `Flux`
- Good for streaming, high-concurrency, or fully reactive systems

Usually a service uses either `spring-boot-starter-web` or `spring-boot-starter-webflux`, not both.

---

## 3) Data and Persistence Modules

Pick the module based on the database or storage technology the microservice uses.

### `spring-boot-starter-data-jpa`
- Spring Data JPA
- Hibernate
- Relational database support
- Repository abstraction

Common for REST APIs backed by MySQL, PostgreSQL, Oracle, or similar databases.

### `spring-boot-starter-data-jdbc`
- Lightweight relational data access
- Simpler than JPA when full ORM behavior is not needed

### `spring-boot-starter-data-r2dbc`
- Reactive relational database access
- Common with WebFlux applications

### `spring-boot-starter-data-mongodb`
- Spring Data MongoDB
- Document database support

### `spring-boot-starter-data-redis`
- Redis support
- Caching
- Key-value access
- Pub/sub support

### `spring-boot-starter-cache`
- Cache abstraction
- Often used with Redis, Caffeine, or Ehcache

---

## 4) Security Modules

These are commonly used when APIs need authentication and authorization.

### `spring-boot-starter-security`
- Core Spring Security support
- Authentication and authorization
- Secure-by-default behavior
- Filter chain support

### `spring-boot-starter-oauth2-resource-server`
- JWT validation
- Bearer token support
- OAuth2 resource server support

This is very common for secured microservices behind an identity provider.

### `spring-boot-starter-oauth2-client`
- OAuth2 login/client support
- Calling protected downstream services

More common in gateway apps or services that integrate with external identity providers.

---

## 5) Messaging and Event Modules

Microservices often communicate through messaging as well as REST APIs.

### `spring-boot-starter-amqp`
- RabbitMQ integration
- Message publishing and consuming

### `spring-kafka`
- Kafka producer and consumer support
- Common for event-driven microservice architectures

`spring-kafka` is a Spring project commonly used with Spring Boot, even though its name does not follow the starter pattern above.

---

## 6) Observability and Operations Modules

These modules help run microservices safely in production.

### `spring-boot-starter-actuator`
- Health endpoints
- Metrics
- Environment and info endpoints

### `micrometer-registry-prometheus`
- Prometheus metrics export
- Common in Kubernetes and containerized deployments

### Tracing libraries
- Micrometer Tracing
- Zipkin/Brave/OpenTelemetry integrations

These are not always direct Spring Boot starters, but they are common production dependencies in microservices.

---

## 7) Configuration and Metadata Modules

### `spring-boot-configuration-processor`
- Generates metadata for `@ConfigurationProperties`
- Improves IDE autocomplete and configuration hints

This is a very useful development-time dependency in larger services.

---

## 8) Common Companion Modules Used with Spring Boot Microservices

These are frequently used in microservice systems, but they belong to the wider Spring ecosystem, especially Spring Cloud, rather than core Spring Boot itself.

### `spring-cloud-starter-config`
- Centralized external configuration

### `spring-cloud-starter-openfeign`
- Declarative HTTP clients between services

### `spring-cloud-starter-gateway`
- API gateway for routing, filters, and edge concerns

### `spring-cloud-starter-netflix-eureka-client`
- Service discovery

### `spring-cloud-starter-circuitbreaker-resilience4j`
- Fault tolerance
- Retries
- Circuit breakers

These are common in distributed microservice platforms, but many teams now use only a subset depending on platform needs.

---

## 9) Typical Module Sets by Use Case

### Minimal REST API microservice
- `spring-boot-starter-web`
- `spring-boot-starter-validation`
- `spring-boot-starter-actuator`
- `spring-boot-starter-test`

### Database-backed REST API
- `spring-boot-starter-web`
- `spring-boot-starter-validation`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-actuator`
- `spring-boot-starter-test`

### Secured REST API
- `spring-boot-starter-web`
- `spring-boot-starter-security`
- `spring-boot-starter-oauth2-resource-server`
- `spring-boot-starter-validation`
- `spring-boot-starter-actuator`
- `spring-boot-starter-test`

### Reactive REST API
- `spring-boot-starter-webflux`
- `spring-boot-starter-validation`
- `spring-boot-starter-actuator`
- `spring-boot-starter-data-r2dbc`
- `spring-boot-starter-test`

---

## 10) Most Important Modules to Know First

If you are learning Spring Boot for RESTful microservices, start with these:

1. `spring-boot-starter-web`
2. `spring-boot-starter-validation`
3. `spring-boot-starter-actuator`
4. `spring-boot-starter-security`
5. `spring-boot-starter-data-jpa`
6. `spring-boot-starter-test`

Then learn these if your architecture needs them:

1. `spring-boot-starter-webflux`
2. `spring-boot-starter-oauth2-resource-server`
3. `spring-boot-starter-data-redis`
4. `spring-kafka`
5. Spring Cloud modules such as Config, Gateway, and OpenFeign

---

## 11) Summary

For most RESTful API microservices, the most commonly used Spring Boot modules are:

- `spring-boot-starter-web`
- `spring-boot-starter-validation`
- `spring-boot-starter-actuator`
- `spring-boot-starter-security`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-test`

Additional modules such as WebFlux, OAuth2 Resource Server, Redis, Kafka, and Spring Cloud components are added when the system requires reactive APIs, token security, caching, messaging, or distributed platform features.
