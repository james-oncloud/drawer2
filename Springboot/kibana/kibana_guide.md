# Kibana Use Cases Guide

This guide explains the main use cases of Kibana, especially in systems built with Spring Boot microservices.

Kibana is a visualization and exploration tool for data stored in Elasticsearch. It is commonly used for log analysis, operational troubleshooting, dashboards, and security/event analysis.

## Key Concepts Review

- **Kibana** is a UI for searching, exploring, and visualizing data stored in Elasticsearch.
- **Kibana does not store logs by itself**. It reads data from Elasticsearch indexes.
- **Kibana is especially useful for logs, operational events, and search analytics**.
- **In microservices, Kibana helps troubleshoot issues across many services** by centralizing and searching logs.
- **Kibana is often used with Elasticsearch and a log shipper** such as Filebeat, Logstash, or Fluent Bit.

---

## 1) What Kibana Is Used For

Kibana is mainly used to:

- Search logs
- Filter logs
- Build dashboards
- Investigate application failures
- Analyze operational events
- Explore Elasticsearch data visually
- Monitor trends and anomalies
- Investigate security-related events

In practice, Kibana is often the interface developers and operations teams use when they need to quickly answer:

- What errors are happening right now?
- Which service is failing?
- When did the failure begin?
- Which requests are slow or broken?
- Are certain users, APIs, or hosts generating abnormal activity?

---

## 2) Most Common Kibana Use Cases

### Log Search and Troubleshooting

This is the most common use case.

Teams use Kibana to:
- search application logs
- filter by service name
- filter by log level such as `ERROR` or `WARN`
- filter by time range
- investigate exception traces
- correlate failures across services

Example:
A Spring Boot payment service starts returning `500` errors. Kibana helps you search logs from that service and see stack traces, timestamps, and related request identifiers.

### Centralized Logging Across Microservices

In microservice systems, each service produces logs. Kibana helps unify them into one searchable view.

This is useful for:
- multiple Spring Boot services
- containerized workloads
- Kubernetes pods
- distributed systems with many moving parts

Instead of checking each container or machine manually, teams search all logs in one place.

### Dashboarding and Visualization

Kibana can create dashboards for:
- error trends
- warning counts
- request volumes
- authentication failures
- business events
- API usage by endpoint
- geographic or user activity patterns

Dashboards help teams see patterns without manually searching logs every time.

### Security Event Analysis

Kibana is often used in security monitoring setups to inspect:
- login failures
- suspicious IP activity
- unusual request patterns
- access anomalies
- infrastructure security logs

This is common in Elastic Stack deployments that include security tooling.

### Operational Monitoring

Kibana can be used to understand:
- deployment issues
- startup failures
- pod/container crashes
- recurring runtime exceptions
- dependency connectivity issues

It is especially valuable during incidents or after releases.

### Business Event Analysis

If business events are indexed into Elasticsearch, Kibana can help analyze:
- order creation trends
- failed payment events
- signup activity
- search behavior
- customer workflow drop-off points

This is less technical and more analytics-oriented, but still a valid use case.

---

## 3) Kibana in a Spring Boot Microservice Environment

A common setup looks like this:

1. Spring Boot services generate logs
2. Logs are collected by Filebeat, Fluent Bit, or Logstash
3. Logs are sent to Elasticsearch
4. Kibana reads those logs from Elasticsearch
5. Teams search, filter, and visualize the logs in Kibana

Typical log fields that make Kibana much more useful:

- timestamp
- service name
- environment
- hostname
- log level
- thread
- trace ID
- span ID
- correlation ID
- request path
- HTTP status
- exception message

With these fields, teams can search logs much more effectively.

---

## 4) Practical Example Use Cases

### Use Case 1: Investigating a Production Error

Problem:
A user reports that an API request failed.

How Kibana helps:
- filter logs by time range
- search by endpoint path
- search by request ID or trace ID
- isolate `ERROR` logs
- inspect stack traces

Outcome:
You quickly find the root cause without manually checking many service logs.

### Use Case 2: Finding Which Microservice Is Causing Latency

Problem:
A request is taking too long.

How Kibana helps:
- search logs related to a request or trace ID
- compare timestamps between services
- identify which service has slow downstream behavior

Outcome:
You narrow down the service causing delays.

### Use Case 3: Verifying a Deployment

Problem:
A new release may have introduced failures.

How Kibana helps:
- compare error counts before and after deployment
- search for new exceptions
- filter logs by version or deployment label

Outcome:
You can quickly confirm whether the release caused operational issues.

### Use Case 4: Auditing Security Events

Problem:
You want to identify repeated failed login attempts.

How Kibana helps:
- filter authentication failure logs
- search by username, IP, or status code
- visualize the frequency over time

Outcome:
You detect suspicious behavior and investigate further.

### Use Case 5: Observing Business Events

Problem:
You want to know how many order failures occurred today.

How Kibana helps:
- query indexed event logs
- filter by event type
- build a visualization or dashboard

Outcome:
You get quick visibility into business-level failures.

---

## 5) Kibana Features Commonly Used

### Discover
Used for:
- free-text log search
- filtering
- browsing documents
- exploring raw log entries

This is usually the first screen developers use.

### Dashboards
Used for:
- visual summaries
- charts
- trend monitoring
- operational overviews

### Visualizations
Used for:
- bar charts
- pie charts
- line charts
- data tables
- histograms
- metric panels

### Data Views
Used for:
- selecting which Elasticsearch indexes to query
- organizing datasets like `logs-*`, `orders-*`, or `audit-*`

### Alerts and Rules
Used for:
- triggering notifications when conditions are met
- watching for repeated errors, spikes, or anomalies

---

## 6) When Kibana Is a Good Fit

Kibana is a strong fit when:

- logs are stored in Elasticsearch
- you need centralized log search
- you want operational dashboards
- you need flexible filtering and ad hoc investigation
- you are working with distributed microservices
- your teams need a shared UI for log analysis

Kibana is especially valuable in incident response and production support workflows.

---

## 7) When Kibana Is Not the Main Tool

Kibana is not always the best primary tool for every observability need.

Examples:
- For time-series infrastructure metrics, Grafana is often preferred.
- For distributed tracing, Jaeger, Zipkin, or Tempo may be more specialized.
- For simple local app debugging, plain console logs may be faster.

So Kibana is usually one part of a broader observability stack, not the whole stack.

---

## 8) Kibana vs Grafana

### Kibana
Best known for:
- Elasticsearch data exploration
- log analysis
- search-driven troubleshooting
- Elastic dashboards

### Grafana
Best known for:
- metrics dashboards
- multi-source visualization
- Prometheus integration
- infrastructure monitoring
- traces and logs from multiple backends

A common pattern is:
- use **Kibana** for logs in Elasticsearch
- use **Grafana** for metrics in Prometheus

---

## 9) Best Practices for Using Kibana with Spring Boot

- Use structured JSON logging if possible
- Include service name in every log
- Include trace ID and correlation ID
- Include environment labels such as `dev`, `test`, or `prod`
- Keep log formats consistent across services
- Create index patterns or data views with clear naming
- Build dashboards for common incident types
- Avoid logging sensitive data such as passwords or tokens

These practices make Kibana far more effective.

---

## 10) Typical Stack Around Kibana

Common supporting tools:

- Spring Boot application
- Logback or another logger
- Filebeat, Fluent Bit, or Logstash
- Elasticsearch
- Kibana

Optional companions:
- Prometheus
- Grafana
- OpenTelemetry
- Jaeger
- Alerting systems

---

## 11) End-to-End Example: Spring Boot App to Kibana Dashboard

This example shows the full flow:

1. Create a new Spring Boot app
2. Add logging and tracing support
3. Write application logs to a file
4. Ship logs into Elasticsearch
5. View and filter them in Kibana

### Step 1: Create a new Spring Boot app

Create a Spring Boot application with these dependencies:

- `spring-boot-starter-web`
- `spring-boot-starter-actuator`
- `micrometer-tracing-bridge-brave`

Example Maven dependencies:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>

<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-brave</artifactId>
</dependency>
```

### Step 2: Configure logging and tracing

Add properties like these:

```properties
spring.application.name=orders-service

management.endpoints.web.exposure.include=health,info
management.tracing.sampling.probability=1.0

logging.file.name=logs/orders-service.log
logging.pattern.level=%5p [service=${spring.application.name:unknown},traceId=%X{traceId:-},spanId=%X{spanId:-}]
```

What this does:

- names the service as `orders-service`
- enables tracing for all requests in local development
- writes logs to `logs/orders-service.log`
- adds `service`, `traceId`, and `spanId` to every log line

### Step 3: Add a controller with logging statements

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/{id}")
    public Map<String, Object> getOrder(@PathVariable String id) {
        log.info("Received request for order {}", id);

        Map<String, Object> order = orderService.getOrder(id);

        log.info("Returning order {} with status {}", id, order.get("status"));
        return order;
    }
}
```

### Step 4: Add a service with tracing and error logging

This example adds both normal logs and a custom trace span.

```java
@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);
    private final Tracer tracer;

    public OrderService(Tracer tracer) {
        this.tracer = tracer;
    }

    public Map<String, Object> getOrder(String id) {
        Span span = tracer.nextSpan().name("load-order");

        try (Tracer.SpanInScope ws = tracer.withSpan(span.start())) {
            log.info("Loading order {}", id);

            if ("500".equals(id)) {
                log.error("Simulated failure while loading order {}", id);
                throw new IllegalStateException("Simulated order lookup failure");
            }

            Map<String, Object> order = new HashMap<>();
            order.put("id", id);
            order.put("status", "CREATED");

            log.info("Successfully loaded order {}", id);
            return order;
        } finally {
            span.end();
        }
    }
}
```

This produces useful log lines such as:

```text
INFO [service=orders-service,traceId=7f3b2c1d9a1e4b2c,spanId=1a2b3c4d5e6f7a8b] Received request for order 101
INFO [service=orders-service,traceId=7f3b2c1d9a1e4b2c,spanId=4b5c6d7e8f9a0b1c] Loading order 101
ERROR [service=orders-service,traceId=fa12bc34de56f789,spanId=aa11bb22cc33dd44] Simulated failure while loading order 500
```

### Step 5: Run Elasticsearch and Kibana

Start Elasticsearch and Kibana locally.

Example commands:

```bash
docker network create somenetwork

docker run -d \
  --name elasticsearch \
  --net somenetwork \
  -p 9200:9200 \
  -e discovery.type=single-node \
  -e xpack.security.enabled=false \
  -e ES_JAVA_OPTS="-Xms512m -Xmx512m" \
  docker.elastic.co/elasticsearch/elasticsearch:8.13.4

docker run -d \
  --name kibana \
  --net somenetwork \
  -p 5601:5601 \
  -e ELASTICSEARCH_HOSTS=http://elasticsearch:9200 \
  docker.elastic.co/kibana/kibana:8.13.4
```

### Step 6: Ship Spring Boot logs to Elasticsearch

Kibana can only show data that already exists in Elasticsearch, so you need a shipper. A simple local option is Filebeat.

Example `filebeat.yml`:

```yaml
filebeat.inputs:
  - type: filestream
    id: springboot-logs
    paths:
      - /logs/orders-service.log

output.elasticsearch:
  hosts: ["http://elasticsearch:9200"]

setup.kibana:
  host: "http://kibana:5601"
```

If you run Filebeat in Docker, mount your local `logs/` directory into the container so it can read `orders-service.log`.

### Step 7: Generate log data

Start the Spring Boot app and call these endpoints:

```bash
curl http://localhost:8080/api/orders/101
curl http://localhost:8080/api/orders/500
```

That gives you:

- normal request logs
- service-level logs
- an error log for troubleshooting
- trace and span IDs attached to the request flow

### Step 8: View the logs in Kibana

Open Kibana:

- `http://localhost:5601`

Then:

1. Create a data view such as `filebeat-*` or whatever index name your shipper created
2. Open `Discover`
3. Search for `orders-service`
4. Filter by `log.level: ERROR`
5. Filter by `traceId` to follow a single request

Useful searches:

- `service=orders-service`
- `Loading order`
- `Simulated failure`
- specific `traceId`

### Step 9: Build a simple Kibana dashboard

You can build a dashboard with panels such as:

- count of `ERROR` logs over time
- count of requests by log level
- top exception messages
- logs grouped by service name

This is useful for quickly spotting:

- repeated failures
- sudden error spikes
- noisy services
- request patterns by time window

### What this example proves

This end-to-end example shows the real value of Kibana in Spring Boot systems:

- the application produces logs
- logs include trace-aware context
- logs are centralized into Elasticsearch
- Kibana makes them searchable and visual
- operational issues become easier to investigate

---

## 12) Summary

Kibana is mainly used to search, analyze, and visualize data stored in Elasticsearch.

Its most common use cases in Spring Boot microservices are:

- centralized log search
- troubleshooting application failures
- monitoring operational events
- analyzing security activity
- building dashboards for logs and events
- investigating issues across multiple services

Kibana is most valuable when your logs are structured, centralized, and enriched with useful fields like service name, trace ID, environment, and log level.


## Logstash
```bash
docker run -d \
  --name logstash \
  --net somenetwork \
  -p 5044:5044 \
  -p 9600:9600 \
  -v "/Users/jamesking/work/drawer2/Springboot/kibana/logstash/logstash.conf:ro" \
  docker.elastic.co/logstash/logstash:8.13.4
  ```