# Observability, Monitoring, and Tracing Tools for Spring Boot Microservices

This document lists the most common observability, monitoring, and tracing tools used with Spring Boot microservices.

In microservice systems, these tools help answer three main questions:

- **Is the service healthy?**
- **What is the service doing?**
- **Where is a failure or slowdown happening across services?**

Observability in Spring Boot usually combines application metrics, logs, distributed traces, health checks, dashboards, and alerting.

## Key Concepts Review

- **Observability** is the broader ability to understand a system from its outputs such as metrics, logs, and traces.
- **Monitoring** is the continuous tracking of system health and performance using dashboards, alerts, and checks.
- **Tracing** follows a request across multiple services so you can locate latency, bottlenecks, and failures.
- **Spring Boot Actuator** is usually the first observability module added to a Spring Boot microservice.
- **Micrometer** is the metrics facade used by Spring Boot for instrumenting applications and exporting metrics.
- **Prometheus, Grafana, Zipkin, Jaeger, and OpenTelemetry** are among the most common tools used around Spring Boot microservices.

---

## 1) Core Spring Boot Observability Modules

These are the most important built-in or Spring-native pieces to know first.

### `spring-boot-starter-actuator`
- Exposes production-ready endpoints
- Health checks
- Metrics
- Info endpoint
- Readiness and liveness probes
- Environment and configuration inspection

Common endpoints:
- `/actuator/health`
- `/actuator/info`
- `/actuator/metrics`
- `/actuator/prometheus`

This is the foundation of observability in most Spring Boot services.

### Micrometer
- Metrics instrumentation facade used by Spring Boot
- Provides a common API independent of the monitoring backend
- Supports counters, timers, gauges, distribution summaries, and tags

Micrometer allows the same Spring Boot app to export metrics to different systems such as Prometheus, Datadog, CloudWatch, and others.

### Micrometer Tracing
- Spring's modern tracing abstraction
- Supports distributed tracing in Boot 3.x ecosystems
- Integrates with OpenTelemetry and tracing backends

This replaced older tracing approaches centered around Spring Cloud Sleuth.

---

## 2) Monitoring Tools Commonly Used with Spring Boot

These tools focus mainly on health, metrics, dashboards, and alerting.

### Prometheus
- Pull-based metrics collection system
- Scrapes metrics from `/actuator/prometheus`
- Strong fit for Kubernetes and containerized platforms
- Common for storing time-series application metrics

Common dependency:
- `micrometer-registry-prometheus`

Prometheus is one of the most common monitoring tools used with Spring Boot microservices.

### Grafana
- Dashboard and visualization platform
- Displays Prometheus metrics
- Used for service dashboards, latency charts, error rates, JVM stats, and infrastructure metrics

Grafana is often paired with Prometheus in Spring Boot microservice deployments.

### Alertmanager
- Works with Prometheus alert rules
- Sends alerts to email, Slack, PagerDuty, and other channels

This helps teams react when latency, error rate, CPU, memory, or availability crosses a threshold.

### Datadog
- Commercial observability platform
- Supports metrics, logs, traces, dashboards, alerting, and service maps

Datadog is common in managed cloud environments where teams want an all-in-one observability product.

### New Relic
- Commercial APM and monitoring platform
- Application performance monitoring
- Tracing
- Infrastructure monitoring
- Alerting and dashboards

### Cloud-native monitoring services
- AWS CloudWatch
- Azure Monitor
- Google Cloud Operations Suite

These are common when Spring Boot microservices are heavily integrated with a specific cloud platform.

---

## 3) Distributed Tracing Tools

These tools help trace a request across multiple services.

### OpenTelemetry
- Open standard for telemetry data
- Covers traces, metrics, and logs
- Increasingly the default direction for modern observability stacks

OpenTelemetry is often used with Spring Boot 3 applications through Micrometer Tracing or direct instrumentation.

### Zipkin
- Distributed tracing backend
- Stores and visualizes trace spans
- Useful for understanding service-to-service call timing

Historically very common in Spring-based microservice systems.

### Jaeger
- Distributed tracing backend
- Strong visualization for request traces
- Common in cloud-native and Kubernetes platforms

### Tempo
- Grafana tracing backend
- Often paired with Grafana and Prometheus in a unified observability stack

---

## 4) Logging Tools Used Alongside Monitoring and Tracing

Logs are not the same as metrics or traces, but they are part of observability.

### Logback
- Default logging framework in Spring Boot
- Used through Spring Boot's logging support

### SLF4J
- Logging facade used by most Spring applications

### ELK Stack
- Elasticsearch
- Logstash
- Kibana

This stack is commonly used for centralized log storage, log search, and log dashboards.

### EFK Stack
- Elasticsearch
- Fluentd or Fluent Bit
- Kibana

Often used in Kubernetes-based platforms.

### Loki
- Log aggregation system from Grafana Labs
- Common with Grafana dashboards

### Splunk
- Enterprise log aggregation and observability platform

For microservices, logs are most useful when they include:
- Request IDs
- Trace IDs
- Correlation IDs
- Service name
- Environment

Those fields make it easier to connect logs with traces and metrics.

---

## 5) Common Spring Boot Dependencies for Observability

Here are the most common dependencies you see in real Spring Boot microservices.

### Built-in Spring Boot starter
- `spring-boot-starter-actuator`

### Common Micrometer registries
- `micrometer-registry-prometheus`
- `micrometer-registry-datadog`
- `micrometer-registry-cloudwatch2`
- `micrometer-registry-stackdriver`

### Tracing-related dependencies
- Micrometer Tracing libraries
- OpenTelemetry exporters
- Zipkin exporters

The exact tracing dependency set depends on Spring Boot version and the chosen backend.

---

## 6) Typical Observability Stack for Spring Boot Microservices

### Common open-source stack
- Spring Boot Actuator
- Micrometer
- Prometheus
- Grafana
- Zipkin or Jaeger
- ELK/Loki for logs

### Common cloud/commercial stack
- Spring Boot Actuator
- Micrometer
- Datadog or New Relic
- Cloud log management
- Cloud alerting

### Kubernetes-focused stack
- Spring Boot Actuator
- Prometheus
- Alertmanager
- Grafana
- Jaeger or Tempo
- Loki

---

## 7) What Each Tool Is Best At

### Best for health endpoints
- Spring Boot Actuator

### Best for application metrics
- Micrometer
- Prometheus
- Datadog
- New Relic

### Best for dashboards
- Grafana
- Datadog
- New Relic

### Best for distributed tracing
- OpenTelemetry
- Zipkin
- Jaeger
- Tempo

### Best for centralized logs
- ELK
- Loki
- Splunk

---

## 8) Typical Metrics Tracked in Spring Boot Microservices

These are the kinds of signals teams usually monitor:

- Request count
- Request latency
- Error rate
- Throughput
- JVM heap usage
- GC pause time
- Thread pool usage
- Database connection pool usage
- HTTP client latency
- CPU and memory usage
- Readiness and liveness health

Spring Boot Actuator and Micrometer make many of these available with minimal setup.

---

## 9) Tracing Concepts to Know

### Trace
- The full journey of a request through multiple services

### Span
- A single operation inside a trace

### Trace ID
- The identifier shared across the full request path

### Span ID
- The identifier for one step within the trace

### Correlation ID
- A request identifier often added to logs for easier troubleshooting

Understanding these terms makes observability tools much easier to use in real systems.

---

## 10) Recommended Tools to Learn First

If you are learning Spring Boot microservice observability, start with these:

1. `spring-boot-starter-actuator`
2. Micrometer
3. Prometheus
4. Grafana
5. OpenTelemetry
6. Zipkin or Jaeger

Then learn centralized logging and alerting tools such as:

1. ELK or Loki
2. Alertmanager
3. Datadog or New Relic

---

## 11) Summary

The most common observability, monitoring, and tracing tools used with Spring Boot microservices are:

- `spring-boot-starter-actuator`
- Micrometer
- Prometheus
- Grafana
- OpenTelemetry
- Zipkin
- Jaeger
- Loki or ELK
- Datadog
- New Relic

In practice, many teams start with Spring Boot Actuator and Micrometer, expose metrics to Prometheus, visualize them in Grafana, and add distributed tracing with OpenTelemetry plus Zipkin or Jaeger.
