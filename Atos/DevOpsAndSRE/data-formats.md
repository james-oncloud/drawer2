If you strip away all of the tooling (Prometheus, Grafana, CloudWatch, Datadog, Alertmanager, OpenTelemetry, Splunk, etc.), almost every monitoring and observability system exchanges just **five fundamental kinds of data**.

Think of it like this:

```
Application
     │
     ├── Metrics
     ├── Logs
     ├── Traces
     ├── Events
     └── Alerts
            │
            ▼
     Dashboards / Notifications / Incident Management
```

Each of these has a fairly standard schema, regardless of the vendor.

---

# 1. Metrics

Metrics are numeric measurements collected over time.

Examples:

- CPU usage
- Memory usage
- HTTP request count
- Database latency
- Queue length

A metric usually consists of:

```text
Metric
│
├── Name
├── Timestamp
├── Value
└── Labels (metadata)
```

Example

```json
{
  "name": "http_requests_total",
  "timestamp": 1721900000,
  "value": 15234,
  "labels": {
      "service": "payments",
      "instance": "payment-01",
      "environment": "prod",
      "status": "200"
  }
}
```

The important parts are:

| Field | Description |
|---------|------------|
| Name | What is being measured |
| Timestamp | When it happened |
| Value | Numeric measurement |
| Labels | Context |

Notice there is **no message**.

Metrics are purely numerical.

---

# 2. Logs

Logs are textual records describing something that happened.

Typical schema

```json
{
    "timestamp": "...",
    "level": "ERROR",
    "message": "Payment gateway timeout",
    "service": "payments",
    "traceId": "abc123",
    "thread": "worker-4",
    "host": "server01"
}
```

Typical fields

```
timestamp
severity
message
service
host
traceId
spanId
attributes
```

Unlike metrics, logs contain rich human-readable information.

---

# 3. Traces

Traces describe the path of a request through multiple services.

Suppose:

```
Browser

    │

API

    │

Payments

    │

Database
```

Each step creates a span.

A span typically looks like

```json
{
    "traceId": "123",
    "spanId": "456",
    "parentSpanId": "111",
    "name": "Process Payment",
    "startTime": "...",
    "endTime": "...",
    "duration": 84,
    "attributes": {
        "service": "payments",
        "http.method": "POST"
    }
}
```

Notice traces are about relationships.

```
Trace
   │
   ├── Span
   ├── Span
   ├── Span
   └── Span
```

---

# 4. Events

Events represent something significant happening.

Examples

- deployment completed
- pod restarted
- user logged in
- database failover
- certificate expired

Typical schema

```json
{
    "eventType": "Deployment",
    "timestamp": "...",
    "service": "payments",
    "description": "Version 2.1 deployed",
    "severity": "INFO"
}
```

Events are neither logs nor metrics.

They describe state changes.

---

# 5. Alerts

Alerts are generated after evaluating data.

For example

```
CPU > 90%
for 10 minutes
```

becomes

```json
{
    "alertName": "HighCPU",
    "status": "FIRING",
    "severity": "critical",
    "startsAt": "...",
    "labels": {
        "service": "payments"
    },
    "annotations": {
        "summary": "CPU exceeded 90%"
    }
}
```

Notice an alert isn't raw monitoring data.

It's derived data.

---

# Common metadata (labels/tags)

Nearly every monitoring system attaches metadata.

Typical labels

```text
service = payments
environment = production
cluster = eu-west-1
namespace = backend
instance = pod-12345
version = 2.4.1
team = payments
```

These allow filtering like

```
Show all metrics

WHERE

service = payments

AND

environment = prod
```

The terminology varies:

- Prometheus: Labels
- OpenTelemetry: Attributes
- Datadog: Tags
- CloudWatch: Dimensions

Conceptually they are the same thing.

---

# Time-series data model

Most monitoring data is time-based.

```
Timestamp          Value

10:00              45

10:01              47

10:02              46

10:03              60

10:04              82
```

This is known as a time series.

```
CPU Usage

90 |                          ●
80 |                      ●
70 |
60 |                  ●
50 |         ●   ●
40 |    ●
   +----------------------------
      t1 t2 t3 t4 t5
```

---

# Data types commonly exchanged

Monitoring systems typically exchange the following data types:

| Type | Example |
|---------|---------|
| Integer | request count |
| Floating point | CPU usage |
| Boolean | service healthy |
| String | log message |
| Timestamp | event time |
| Duration | response time |
| Labels | service=payments |
| Arrays | multiple tags |
| Maps | attributes |
| UUIDs | trace IDs |

---

# Relationships between the data

```
Application
      │
      │ emits
      ▼

+----------------------+
| Metrics              |
+----------------------+

+----------------------+
| Logs                 |
+----------------------+

+----------------------+
| Traces               |
+----------------------+

+----------------------+
| Events               |
+----------------------+

           │

           ▼

Rule Engine

IF

CPU > 90

AND

Errors > 5%

AND

Latency > 500ms

↓

Generate Alert

↓

Incident

↓

Notification
```

The rule engine correlates multiple signals before producing an alert.

---

# The "golden" schema

Almost every piece of monitoring data can be reduced to this generic structure:

```json
{
    "timestamp": "...",
    "type": "metric | log | trace | event | alert",
    "name": "...",
    "value": "...",
    "severity": "...",
    "labels": {
        "...": "..."
    },
    "attributes": {
        "...": "..."
    }
}
```

Each category then adds its own specialised fields (for example, metrics have numeric values, traces have `traceId` and `spanId`, and alerts have `status` and `startsAt`).

## How these data types flow together

A typical end-to-end monitoring flow looks like this:

1. **Applications and infrastructure emit telemetry**:
   - Metrics (e.g. `http_request_duration = 850 ms`)
   - Logs (e.g. `"Database timeout"`)
   - Traces (showing the request path through services)
   - Events (e.g. "New deployment completed")

2. **A monitoring system stores and correlates the telemetry** using timestamps and common metadata such as `service`, `environment`, and `instance`.

3. **Alert rules evaluate the telemetry**, for example:
   - Average latency > 500 ms for 5 minutes.
   - Error rate > 5%.
   - Deployment event followed by a spike in errors.

4. **An alert object is generated**, containing the rule that fired, severity, timestamps, labels, and contextual annotations.

5. **Downstream systems consume the alert** (incident management, ticketing, paging, chat notifications, dashboards), often using a structured alert payload rather than the original metrics or logs.

This separation of concerns—**telemetry → evaluation → alert**—is the core architecture shared by nearly all modern monitoring and observability platforms, regardless of the specific products involved.


---

## Trace vs Span

A **trace** is the full story of one request. A **span** is one step in that story.

### Span
A **span** is a single timed unit of work — one operation with a start, end, and duration. Examples: `HTTP GET /checkout`, `Process Payment`, `SQL SELECT`.

Typical fields (as in your notes):

- `traceId` — which request this belongs to  
- `spanId` — this operation’s ID  
- `parentSpanId` — the operation that called it  
- `name`, `startTime`, `endTime`, `duration`, attributes  

### Trace
A **trace** is the tree of all spans that share the same `traceId`. It stitches those steps into one request path across services:

```
Trace (one request)
   ├── Span: API Gateway
   │     └── Span: Checkout service
   │           ├── Span: Process Payment
   │           └── Span: Database query
```

### Quick contrast

| | **Span** | **Trace** |
|---|---|---|
| What | One operation | Whole request journey |
| Time | Duration of that step | End-to-end latency (root to last child) |
| ID | `spanId` | `traceId` shared by all spans |
| Structure | Node | Tree of spans linked by `parentSpanId` |

**Rule of thumb:** spans are the building blocks; a trace is the assembled request story.