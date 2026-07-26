# Alerting setup — high-level view

How each piece fits into one alerting pipeline: **telemetry → scrape → evaluate → route → ticket**.

```text
Java + Spring App
        │  (metrics via /actuator/prometheus, logs separately)
        ▼
ServiceMonitor  ──────────────────┐
                                  │  tells Prometheus what to scrape
yet-another-cloudwatch-exporter ──┤  (AWS metrics → Prometheus format)
                                  ▼
                           Prometheus
                                  │  evaluates PrometheusRules
                                  ▼
                           Alertmanager
                                  │  groups, silences, routes
                                  ▼
                           ServiceNow
                                  (incident / ticket)

Helm packages: Deployment, ServiceMonitor, PrometheusRules, alert expressions
```

---

## Java + Spring App (logs and metric data)

The **source of truth for app health**.

- Exposes **metrics** (e.g. Micrometer → `/actuator/prometheus`): request rate, latency, errors, JVM, custom business metrics.
- Emits **logs** for detail during investigation (usually not what fires the alert directly; alerts are typically metric-driven).
- Role in alerting: provide the signals Prometheus (or log pipelines) can evaluate.

## Helm Packaging (Deployment and Alert Expressions)

The **delivery mechanism** for the whole stack as code.

- Deploys the Spring app (Deployment, Service, config).
- Ships **alert expressions** and related Kubernetes objects with the chart (or an ops chart): `ServiceMonitor`, `PrometheusRule`, thresholds, labels.
- Role in alerting: version and promote “what to watch” alongside “what to run,” so each environment gets consistent rules.

## ServiceMonitor

The **scrape contract** between the app and Prometheus (Prometheus Operator pattern).

- Declares: which pods/services to scrape, path (`/actuator/prometheus`), interval, labels.
- Role in alerting: without scrape discovery, Prometheus never sees the app metrics that rules depend on.

## yet-another-cloudwatch-exporter

The **bridge from AWS CloudWatch into Prometheus**.

- Pulls CloudWatch metrics (ALB, RDS, SQS, Lambda, etc.) and exposes them as Prometheus metrics.
- Role in alerting: same Prometheus/Alertmanager path can fire on **cloud infrastructure** signals, not only on app `/actuator` metrics.

## Prometheus + Alertmanager

The **brain and the dispatcher**.

- **Prometheus**: stores time series and continuously evaluates alert rules against scraped metrics.
- **Alertmanager**: receives firing alerts; handles grouping, deduplication, silencing, inhibition, and routing to receivers.
- Role in alerting: decide *when* something is wrong, then *who/what* gets notified.

## Prometheus Rules

The **conditions that create alerts**.

- Expressions such as: error rate > 5% for 5m, p99 latency high, CloudWatch queue depth growing, target down.
- Attached labels/annotations (severity, runbook URL, service name) travel with the alert.
- Role in alerting: turn raw metrics into named, actionable alert events.

## ServiceNow

The **human workflow / incident system**.

- Alertmanager (often via webhook, SNS, or a middleware) opens or updates an incident.
- Role in alerting: turn a technical alert into an owned ticket—assignment, SLA clocks, communication, resolution tracking.

---

## End-to-end in one sentence

The Spring app (and CloudWatch via the exporter) produce metrics; Helm deploys scrape config (`ServiceMonitor`) and rules (`PrometheusRule`); Prometheus evaluates those rules and hands firings to Alertmanager; Alertmanager routes them into ServiceNow so someone can act.

---

# Setting up a new alert — expressions & fields

A new alert is mostly a **PrometheusRule** (PromQL `expr` + metadata). Everything else must already be in place so that metric exists and the firing alert can be routed.

## Prerequisites checklist

Before writing the expression, confirm:

1. **Metric exists** — app exposes it (`/actuator/prometheus`) or YACE exports it from CloudWatch.
2. **ServiceMonitor** scrapes the app (or the exporter is scraped) with stable labels (`service`, `namespace`, `app`, etc.).
3. **Helm** can ship a `PrometheusRule` (or values that template one).
4. **Alertmanager** routes on labels you will set (e.g. `severity`, `team`, `service`) to ServiceNow.

---

## Anatomy of a PrometheusRule alert

Every alert needs these fields:

| Field | Purpose |
|---|---|
| `alert` | Alert name (stable identifier) |
| `expr` | PromQL expression — the actual condition |
| `for` | How long the condition must stay true before firing (reduces flapping) |
| `labels` | Routing & grouping (`severity`, `team`, `service`, `env`) |
| `annotations` | Human context (`summary`, `description`, `runbook_url`) |

Example shape (Kubernetes `PrometheusRule`):

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: checkout-service-alerts
  labels:
    release: prometheus   # must match Prometheus Operator ruleSelector
spec:
  groups:
    - name: checkout-service
      rules:
        - alert: HighErrorRate
          expr: |
            (
              sum(rate(http_server_requests_seconds_count{application="checkout",status=~"5.."}[5m]))
              /
              sum(rate(http_server_requests_seconds_count{application="checkout"}[5m]))
            ) > 0.05
          for: 5m
          labels:
            severity: critical
            team: payments
            service: checkout
            env: prod
          annotations:
            summary: "High error rate on checkout"
            description: "5xx rate is {{ $value | humanizePercentage }} over 5m (threshold 5%)."
            runbook_url: "https://wiki.example/runbooks/checkout-high-error-rate"
```

---

## Writing the `expr` (PromQL patterns)

### 1. Availability / error rate (Spring Micrometer HTTP)

Micrometer often exposes `http_server_requests_seconds_count` with `status` (or `outcome`) labels.

```promql
# Error rate > 5%
sum(rate(http_server_requests_seconds_count{application="checkout",status=~"5.."}[5m]))
/
sum(rate(http_server_requests_seconds_count{application="checkout"}[5m]))
> 0.05
```

### 2. Latency (histogram → quantile)

```promql
# p99 latency > 1s
histogram_quantile(
  0.99,
  sum by (le) (
    rate(http_server_requests_seconds_bucket{application="checkout",uri="/api/pay"}[5m])
  )
) > 1
```

### 3. Target down (scrape failed)

```promql
up{job="checkout-service"} == 0
```

Often paired with `for: 2m` so a brief scrape blip does not page.

### 4. Traffic / saturation style signals

```promql
# Sudden drop in traffic (possible outage upstream of metrics)
sum(rate(http_server_requests_seconds_count{application="checkout"}[5m])) < 1

# JVM heap pressure (example Micrometer JVM metric)
jvm_memory_used_bytes{application="checkout",area="heap"}
/
jvm_memory_max_bytes{application="checkout",area="heap"}
> 0.90
```

### 5. CloudWatch via yet-another-cloudwatch-exporter

YACE metric names depend on config; typical pattern is something like `aws_<namespace>_...`. Examples of *kinds* of expressions:

```promql
# ALB 5xx spike (illustrative metric name — match your YACE config)
sum(rate(aws_applicationelb_httpcode_target_5_xx_count_sum{load_balancer="app/checkout-alb"}[5m])) > 10

# SQS queue backing up
aws_sqs_approximate_number_of_messages_visible_average{queue_name="checkout-events"} > 1000

# RDS CPU high
aws_rds_cpuutilization_average{dbinstance_identifier="checkout-db"} > 80
```

Always verify the exact series name/labels in Prometheus (`/graph` or Metrics explorer) before locking the rule.

---

## Choosing `for` and thresholds

| Concern | Typical choice |
|---|---|
| Page someone now | `severity: critical`, shorter `for` (e.g. `2m`–`5m`) |
| Ticket / business hours | `severity: warning`, longer `for` (e.g. `10m`–`30m`) |
| Avoid flap | Prefer `rate(...[5m])` + `for: 5m` over instantaneous spikes |
| SLO-style | Alert on **burn rate** / error budget, not every blip |

Rule of thumb: alert on **user-facing symptoms** (errors, latency, freshness) before raw CPU unless CPU is a proven early indicator.

---

## Labels that make Alertmanager → ServiceNow work

Set labels the router and ticket mapper expect. Common set:

```yaml
labels:
  severity: critical|warning|info
  team: <owning-team>
  service: <service-name>
  env: prod|stage
```

Alertmanager then matches those labels to a receiver (webhook/SNS → ServiceNow). Missing `team`/`severity` often means the alert fires in Prometheus but never becomes a usable incident.

Annotations are for humans and ticket text (`summary`, `description`, `runbook_url`); they usually do **not** drive routing.

---

## Helm: where the expression lives

Typical pattern — values drive thresholds; template renders `PrometheusRule`:

```yaml
# values.yaml
alerting:
  enabled: true
  rules:
    highErrorRate:
      enabled: true
      threshold: 0.05
      for: 5m
      severity: critical
```

```yaml
# templates/prometheusrule.yaml (sketch)
expr: |
  (... error rate promql ...) > {{ .Values.alerting.rules.highErrorRate.threshold }}
for: {{ .Values.alerting.rules.highErrorRate.for }}
labels:
  severity: {{ .Values.alerting.rules.highErrorRate.severity }}
  service: {{ .Values.app.name }}
```

That way each environment can override thresholds without rewriting PromQL by hand.

---

## Minimal “new alert” recipe

1. Confirm metric + labels in Prometheus.
2. Write `expr` (condition) and pick `for`.
3. Add `labels` for routing (`severity`, `team`, `service`, `env`).
4. Add `annotations` (`summary`, `description`, `runbook_url`).
5. Ship via Helm as a `PrometheusRule` (and ensure `ServiceMonitor` / YACE already scrape the source).
6. Confirm Alertmanager route → ServiceNow creates/updates an incident with those fields.

---

## Worked example: “checkout 5xx too high”

```yaml
- alert: CheckoutHigh5xxRate
  expr: |
    (
      sum(rate(http_server_requests_seconds_count{application="checkout",status=~"5.."}[5m]))
      /
      clamp_min(sum(rate(http_server_requests_seconds_count{application="checkout"}[5m])), 0.001)
    ) > 0.05
  for: 5m
  labels:
    severity: critical
    team: payments
    service: checkout
    env: prod
  annotations:
    summary: "Checkout 5xx rate above 5%"
    description: "Current 5xx ratio is {{ $value | humanizePercentage }}."
    runbook_url: "https://wiki.example/runbooks/checkout-5xx"
```

`clamp_min(..., 0.001)` avoids divide-by-zero when traffic is near zero (optional but useful).
