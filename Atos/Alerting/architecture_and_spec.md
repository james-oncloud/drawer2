



# ServiceNow Alerting Integration Specification

## 1. Purpose

This specification defines an automated monitoring and incident-management pipeline in which:

1. An application and its AWS infrastructure generate operational signals.
2. CloudWatch and Prometheus collect those signals as metrics.
3. Prometheus evaluates alerting rules.
4. Alertmanager groups, deduplicates and routes alerts.
5. An integration component publishes a normalised alert message to an Amazon SNS topic.
6. An SNS subscriber creates or updates a ServiceNow incident.
7. When the alert resolves, the corresponding ServiceNow incident is updated or resolved.

The intended outcome is:

> A persistent operational failure automatically creates one ServiceNow incident, rather than producing repeated duplicate tickets every time Prometheus evaluates the alert.

---

# 2. Important clarification about the components

The responsibilities should be separated as follows:

```text
Application
    │
    ├── Application metrics ──────────────► Prometheus
    │
    ├── Logs ─► CloudWatch Logs
    │              │
    │              └── Metric filters / derived metrics ─► CloudWatch Metrics
    │
    └── AWS service behaviour ────────────► CloudWatch Metrics
                                                   │
                                                   ▼
                                       Yet Another CloudWatch Exporter
                                                   │
                                                   ▼
                                               Prometheus
                                                   │
                                         Alerting rule evaluation
                                                   │
                                                   ▼
                                             Alertmanager
                                                   │
                                      Webhook / SNS publisher adapter
                                                   │
                                                   ▼
                                                SNS Topic
                                                   │
                                      Lambda / HTTPS subscriber / SQS
                                                   │
                                                   ▼
                                               ServiceNow
```

Two distinctions are important:

- **Yet Another CloudWatch Exporter, or YACE, exports CloudWatch metrics into Prometheus format.** It does not normally read application log text directly. Logs must first be converted into CloudWatch metrics, for example through CloudWatch Logs metric filters, or processed by a separate logging pipeline. YACE describes itself as an exporter that discovers AWS resources and exposes their CloudWatch metrics to Prometheus. citeturn418752search2
- A Kubernetes **ServiceMonitor** tells the Prometheus Operator how Prometheus should discover and scrape a metrics endpoint. It does not transport alerts to Alertmanager. Prometheus evaluates alert rules and sends the resulting alert objects to Alertmanager.

Alertmanager then handles grouping, deduplication, routing, silencing and inhibition. citeturn418752search0turn418752search10

---

# 3. Scope

## 3.1 In scope

The solution covers:

- Application-generated Prometheus metrics.
- AWS CloudWatch metrics exposed through YACE.
- Metrics derived from CloudWatch Logs.
- Prometheus alerting rules.
- Alertmanager routing and notification behaviour.
- Alertmanager-to-SNS integration.
- SNS topic security and subscriptions.
- Creation and updating of ServiceNow incidents.
- Alert correlation and deduplication.
- Resolution handling.
- Retries, dead-letter handling and observability.
- Kubernetes deployment considerations.
- Security and access control.

## 3.2 Out of scope

Unless specifically added, this specification does not cover:

- Collection and search of raw application logs.
- Grafana dashboards.
- ServiceNow user-interface configuration.
- Manual incident workflows after assignment.
- Automated remediation.
- ServiceNow change or problem records.
- Distributed tracing.

---

# 4. Functional architecture

## 4.1 Application

The application shall expose operational metrics using a Prometheus-compatible endpoint, normally:

```text
GET /metrics
```

For a Spring Boot application this may be:

```text
GET /actuator/prometheus
```

Typical application metrics include:

```text
http_server_requests_seconds_count
http_server_requests_seconds_sum
application_errors_total
database_connection_failures_total
external_service_requests_total
external_service_request_duration_seconds
jvm_memory_used_bytes
process_cpu_usage
```

Each metric should contain sufficient labels to identify the affected system:

```text
application
service
environment
cluster
namespace
region
instance
operation
dependency
```

Example:

```text
application_errors_total{
  application="payments",
  service="payment-api",
  environment="production",
  cluster="prod-eks-01",
  namespace="payments",
  error_type="database_timeout"
} 17
```

Avoid labels containing unbounded values such as:

```text
user_id
request_id
transaction_id
timestamp
full_url
exception_message
```

These create excessive Prometheus time-series cardinality.

---

## 4.2 Application logs

The application may send structured logs to CloudWatch Logs.

Example log:

```json
{
  "timestamp": "2026-07-24T18:15:32Z",
  "level": "ERROR",
  "application": "payments",
  "environment": "production",
  "eventType": "PaymentDatabaseTimeout",
  "message": "Database connection timed out",
  "correlationId": "78445dd7-a0f2-49a8-ae41-aabb103bc333"
}
```

Logs shall not normally be consumed directly by Prometheus.

Where log events must trigger metric alerts, a CloudWatch Logs metric filter may convert matching log events into a CloudWatch metric.

Example conceptual transformation:

```text
CloudWatch log entry:

eventType = PaymentDatabaseTimeout
             │
             ▼
CloudWatch Logs metric filter
             │
             ▼
Custom/Payments.DatabaseTimeoutCount
```

The resulting CloudWatch metric can then be collected by YACE.

This distinction prevents the monitoring solution from treating Prometheus as a log-processing platform.

---

# 5. Yet Another CloudWatch Exporter

## 5.1 Responsibility

YACE shall:

1. Authenticate to AWS.
2. Discover configured AWS resources.
3. Query CloudWatch metrics.
4. Convert those metrics into Prometheus metric format.
5. expose those metrics through an HTTP `/metrics` endpoint.
6. Be scraped by Prometheus.

YACE uses the AWS SDK and can discover AWS resources through tags. citeturn418752search2

## 5.2 Example YACE configuration

The following example collects Application Load Balancer metrics:

```yaml
apiVersion: v1alpha1

discovery:
  exportedTagsOnMetrics:
    AWS/ApplicationELB:
      - Environment
      - Application

  jobs:
    - type: AWS/ApplicationELB

      regions:
        - eu-west-2

      roles:
        - roleArn: arn:aws:iam::123456789012:role/prometheus-cloudwatch-reader

      searchTags:
        - key: Environment
          value: production

      period: 300

      length: 600

      delay: 120

      metrics:
        - name: HTTPCode_Target_5XX_Count
          statistics:
            - Sum

        - name: UnHealthyHostCount
          statistics:
            - Maximum

        - name: TargetResponseTime
          statistics:
            - Average
            - p95
```

The exact syntax depends on the installed YACE version and should be checked against its deployed configuration schema.

## 5.3 Required AWS permissions

The YACE workload shall use an IAM role with read-only CloudWatch and resource-discovery permissions.

Conceptually, it requires permissions such as:

```text
cloudwatch:GetMetricData
cloudwatch:GetMetricStatistics
cloudwatch:ListMetrics
tag:GetResources
apigateway:GET
ec2:DescribeInstances
elasticloadbalancing:DescribeLoadBalancers
```

Only permissions needed for the configured AWS services should be granted.

In EKS, IAM Roles for Service Accounts or EKS Pod Identity should be preferred over static AWS access keys.

---

# 6. ServiceMonitor configuration

A Kubernetes Service shall expose the YACE HTTP endpoint.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: yace
  namespace: monitoring
  labels:
    app: yace
spec:
  selector:
    app: yace
  ports:
    - name: metrics
      port: 5000
      targetPort: metrics
```

The Prometheus Operator ServiceMonitor shall instruct Prometheus to scrape it:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: yace
  namespace: monitoring
  labels:
    monitoring: platform
spec:
  namespaceSelector:
    matchNames:
      - monitoring

  selector:
    matchLabels:
      app: yace

  endpoints:
    - port: metrics
      path: /metrics
      interval: 60s
      scrapeTimeout: 30s
```

A separate ServiceMonitor may scrape the application:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: payment-api
  namespace: monitoring
spec:
  namespaceSelector:
    matchNames:
      - payments

  selector:
    matchLabels:
      app: payment-api

  endpoints:
    - port: management
      path: /actuator/prometheus
      interval: 30s
```

The ServiceMonitor itself does not evaluate alerts. It only configures metric collection.

---

# 7. Prometheus

## 7.1 Responsibilities

Prometheus shall:

1. Scrape application metrics.
2. Scrape YACE metrics.
3. Store the resulting time series.
4. Evaluate alerting rules using PromQL.
5. Maintain alert state.
6. Send firing and resolved alerts to Alertmanager.

Prometheus alerting rules are based on PromQL expressions. citeturn418752search3

## 7.2 How Prometheus rules work

Prometheus does not alert on raw scraped samples by itself. It periodically evaluates **rules** written in PromQL. Each evaluation inspects the current time-series data and decides whether an alert should become pending, firing or resolved.

In this architecture, rules are normally declared as Kubernetes `PrometheusRule` custom resources. The Prometheus Operator selects those resources and loads them into the Prometheus configuration. The same rule semantics apply whether rules come from a `PrometheusRule` object or from a classic Prometheus rule file.

### 7.2.1 Rule groups

Rules are organised into **groups**. A group has:

| Field | Purpose |
|---|---|
| `name` | Logical name for the group, for example `payment-api.rules` |
| `interval` | How often Prometheus evaluates every rule in the group |
| `rules` | The ordered list of alerting or recording rules |

Example structure:

```text
PrometheusRule
  └── groups[]
        └── group
              ├── name: payment-api.rules
              ├── interval: 30s
              └── rules[]
                    ├── alerting rule
                    └── recording rule (optional)
```

Prometheus evaluates each group on its own schedule. Within a group, rules are evaluated sequentially. A typical interval is 15s or 30s. Shorter intervals detect failures sooner but increase query load.

### 7.2.2 Two kinds of rule

Prometheus supports two rule types:

| Type | Purpose |
|---|---|
| **Alerting rule** | Creates an alert when a PromQL expression returns one or more time series |
| **Recording rule** | Precomputes a PromQL expression and stores the result as a new time series |

Recording rules are useful for expensive or frequently reused expressions, for example a precomputed error-rate metric that several alerts and dashboards can share. Alerting rules are the rules that ultimately create ServiceNow incidents in this design.

### 7.2.3 Anatomy of an alerting rule

An alerting rule contains:

| Field | Meaning |
|---|---|
| `alert` | Alert name. Prometheus exposes it as the `alertname` label |
| `expr` | PromQL expression that defines the failure condition |
| `for` | How long the expression must remain true before the alert fires |
| `labels` | Extra labels attached to the alert. Used for routing and correlation |
| `annotations` | Human-readable fields such as summary, description and runbook URL |

Conceptually:

```text
every evaluation interval
        │
        ▼
evaluate PromQL expr against current metrics
        │
        ├── no matching series ──► alert inactive / resolved
        │
        └── one or more matching series
                │
                ├── true for less than `for` ──► Pending
                └── true for at least `for` ──► Firing
                        │
                        ▼
              send alert object(s) to Alertmanager
```

Important details:

- Each distinct label set returned by `expr` becomes a separate alert instance. For example, if the expression is grouped by `service` and `namespace`, each failing service/namespace combination is a separate alert.
- The `for` clause is what stops brief spikes from creating tickets. The expression must stay true across successive evaluations for the whole duration.
- **Labels** are machine-oriented. Alertmanager uses them for grouping, routing, inhibition and deduplication. The ServiceNow integration also uses them for assignment and priority.
- **Annotations** are human-oriented. They do not affect Alertmanager routing. They should carry the text that operators and ServiceNow need to understand the incident.

### 7.2.4 Evaluation and Alertmanager hand-off

Prometheus owns alert state. Alertmanager does not re-evaluate PromQL.

The hand-off works as follows:

1. Prometheus scrapes metrics and stores time series.
2. On each group interval, Prometheus evaluates the group's rules.
3. For each alerting rule whose expression is true long enough, Prometheus marks the alert as firing.
4. Prometheus sends the current set of firing alerts to Alertmanager.
5. When the expression later becomes false, Prometheus marks the alert resolved and notifies Alertmanager.
6. Alertmanager then groups, deduplicates, silences, inhibits and routes the notification downstream.

Prometheus therefore answers: “Is this condition currently true?”  
Alertmanager answers: “Given that alert, whom should we notify, how often, and with what grouping?”

### 7.2.5 PromQL expression expectations

Alert expressions should return series only when action is required. Prefer threshold comparisons over bare rates:

```promql
# Good: returns series only when the condition is breached
rate(http_server_requests_seconds_count{status=~"5.."}[5m])
  /
rate(http_server_requests_seconds_count[5m])
  > 0.05

# Poor for alerting: always returns a value, so the alert is always "true"
rate(http_server_requests_seconds_count{status=~"5.."}[5m])
```

Expressions used for ServiceNow alerts should also preserve the labels needed for incident correlation, typically:

- `application`
- `service`
- `environment`
- `cluster`
- `namespace`

Those labels must either already exist on the source metrics or be added by the rule's static `labels` block.

### 7.2.6 Relationship to this architecture

In this solution:

- Application and YACE metrics are scraped into Prometheus.
- `PrometheusRule` objects define the failure conditions.
- Prometheus evaluates those rules and maintains alert state.
- Only firing and resolved alerts are sent to Alertmanager.
- Alertmanager, not Prometheus, is responsible for reducing noise before ServiceNow ticket creation.

The `for` duration on the Prometheus rule is therefore the first noise-reduction control. Alertmanager grouping and deduplication are the second. Together they ensure a persistent failure creates one incident rather than one ticket per evaluation cycle.

## 7.3 Alert lifecycle

A Prometheus alert normally moves through these states:

```text
Inactive
   │ expression becomes true
   ▼
Pending
   │ remains true for configured `for` period
   ▼
Firing
   │ expression becomes false
   ▼
Resolved
```

The `for` duration prevents transient failures from immediately creating ServiceNow incidents.

Example:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: payment-api-alerts
  namespace: monitoring
spec:
  groups:
    - name: payment-api.rules
      interval: 30s

      rules:
        - alert: PaymentApiHighErrorRate

          expr: |
            (
              sum by (application, service, environment, cluster, namespace) (
                rate(http_server_requests_seconds_count{
                  application="payments",
                  service="payment-api",
                  status=~"5.."
                }[5m])
              )
              /
              sum by (application, service, environment, cluster, namespace) (
                rate(http_server_requests_seconds_count{
                  application="payments",
                  service="payment-api"
                }[5m])
              )
            ) > 0.05

          for: 10m

          labels:
            severity: critical
            team: payments
            service: payment-api
            environment: production
            notification_target: servicenow

          annotations:
            summary: "Payment API error rate is above 5%"

            description: |
              The Payment API has returned more than 5% HTTP 5xx
              responses during the last five minutes.

            runbook_url: |
              https://internal.example/runbooks/payment-api-high-error-rate

            dashboard_url: |
              https://grafana.example/d/payment-api
```

## 7.4 CloudWatch-derived alert example

```yaml
- alert: PaymentLoadBalancerHasUnhealthyTargets

  expr: |
    aws_applicationelb_un_healthy_host_count_maximum{
      tag_Environment="production",
      tag_Application="payments"
    } > 0

  for: 5m

  labels:
    severity: critical
    team: payments
    service: payment-api
    environment: production
    notification_target: servicenow

  annotations:
    summary: "Payment load balancer has unhealthy targets"

    description: |
      One or more payment application load-balancer targets
      have remained unhealthy for at least five minutes.

    runbook_url: |
      https://internal.example/runbooks/alb-unhealthy-target
```

## 7.5 Required alert metadata

Every alert intended for ServiceNow shall provide:

| Field | Purpose |
|---|---|
| `alertname` | Identifies the alert rule |
| `severity` | Determines ServiceNow urgency and impact |
| `service` | Identifies the affected service |
| `environment` | Separates production and non-production alerts |
| `team` | Determines assignment group |
| `cluster` | Identifies the execution environment |
| `namespace` | Identifies the Kubernetes namespace |
| `summary` | Becomes the short incident description |
| `description` | Provides incident details |
| `runbook_url` | Gives operational recovery instructions |
| `dashboard_url` | Links to supporting metrics |

Production alerts should normally be the only alerts routed to ServiceNow.

---

# 8. Alertmanager

## 8.1 Responsibilities

Alertmanager shall:

- Receive alerts from Prometheus.
- Group related alert instances.
- Deduplicate repeated notifications.
- Route alerts according to labels.
- Apply silences.
- Apply inhibition rules.
- Send firing notifications.
- Send resolved notifications.

These are the core responsibilities defined by Alertmanager. citeturn418752search0turn418752search43

## 8.2 Routing model

A typical routing hierarchy is:

```text
All alerts
   │
   ├── severity = warning
   │      └── team communication channel
   │
   ├── severity = critical
   │   environment = production
   │   notification_target = servicenow
   │      └── SNS integration webhook
   │
   └── Watchdog / InfoInhibitor
          └── discarded or special receiver
```

## 8.3 Example Alertmanager configuration

```yaml
global:
  resolve_timeout: 5m

route:
  receiver: default-receiver

  group_by:
    - alertname
    - service
    - environment
    - cluster

  group_wait: 30s

  group_interval: 5m

  repeat_interval: 4h

  routes:
    - receiver: servicenow-sns-bridge

      matchers:
        - severity="critical"
        - environment="production"
        - notification_target="servicenow"

      continue: false

receivers:
  - name: default-receiver

  - name: servicenow-sns-bridge
    webhook_configs:
      - url: http://alert-sns-publisher.monitoring.svc.cluster.local:8080/alerts

        send_resolved: true

        max_alerts: 100
```

Alertmanager supports generic webhook receivers for notification systems that are not directly supported. citeturn418752search36turn418752search44

## 8.4 Grouping parameters

### `group_by`

Controls which alerts are included in one notification.

Recommended:

```yaml
group_by:
  - alertname
  - service
  - environment
  - cluster
```

This means ten failing pods for the same service may produce one grouped ServiceNow incident rather than ten incidents.

### `group_wait`

The delay before sending the first notification for a new group.

Example:

```yaml
group_wait: 30s
```

This gives related alerts time to arrive and be grouped.

### `group_interval`

The minimum interval before sending an updated notification for an existing group.

Example:

```yaml
group_interval: 5m
```

### `repeat_interval`

How frequently Alertmanager resends a still-firing alert.

Example:

```yaml
repeat_interval: 4h
```

The ServiceNow integration must treat repeat notifications as updates, not new incidents.

## 8.5 Configuring Alertmanager for new alerts

Adding a new Prometheus alert does **not** always require an Alertmanager configuration change. Alertmanager routes on **labels**, not on alert names. A new alert reaches ServiceNow when its labels match an existing route.

```text
New PrometheusRule
        │
        ▼
Alert labels attached
  severity / environment / notification_target / ...
        │
        ▼
Alertmanager evaluates route tree
        │
        ├── labels match existing ServiceNow route
        │         └── no Alertmanager change required
        │
        └── labels do not match any desired route
                  └── add or adjust a route / receiver
```

### 8.5.1 Default case: reuse the existing ServiceNow route

For most production incident alerts, configure the **Prometheus rule**, not Alertmanager.

1. Create or update a `PrometheusRule` with the alert expression and `for` duration.
2. Attach the labels that the ServiceNow route already matches.
3. Attach the annotations ServiceNow needs for the incident text.
4. Confirm Prometheus loads the rule and Alertmanager receives the alert.
5. Confirm the existing route selects the SNS bridge receiver.

Minimum labels for the ServiceNow route in this specification:

```yaml
labels:
  severity: critical
  environment: production
  notification_target: servicenow
  service: payment-api
  team: payments
```

If those labels are present, the existing route already sends the alert to the SNS publisher:

```yaml
routes:
  - receiver: servicenow-sns-bridge
    matchers:
      - severity="critical"
      - environment="production"
      - notification_target="servicenow"
```

No Alertmanager edit is required for every new `alertname`.

### 8.5.2 When Alertmanager must be changed

Change Alertmanager configuration only when one of the following is true:

| Situation | Alertmanager change |
|---|---|
| New destination, for example Slack instead of ServiceNow | Add a receiver and a matching route |
| Different match criteria, for example warning alerts to a team channel | Add a child route with different matchers |
| Different grouping for a service or alert family | Override `group_by` on a child route |
| Different wait / repeat behaviour for noisy alerts | Override `group_wait`, `group_interval` or `repeat_interval` on a child route |
| One alert should suppress another | Add an inhibition rule |
| Temporary suppression during maintenance | Create a silence, preferably without editing permanent config |

### 8.5.3 Step-by-step: add a new ServiceNow-bound alert

Use this checklist when introducing a new alert that should create ServiceNow incidents.

**Step 1 — Define the Prometheus rule**

```yaml
- alert: PaymentApiHighLatency

  expr: |
    histogram_quantile(
      0.95,
      sum by (le, service, environment, cluster, namespace) (
        rate(http_server_requests_seconds_bucket{
          application="payments",
          service="payment-api"
        }[5m])
      )
    ) > 2

  for: 10m

  labels:
    severity: critical
    environment: production
    notification_target: servicenow
    service: payment-api
    team: payments

  annotations:
    summary: "Payment API p95 latency is above 2 seconds"
    description: |
      The Payment API 95th-percentile latency has remained
      above two seconds for at least ten minutes.
    runbook_url: https://internal.example/runbooks/payment-api-high-latency
    dashboard_url: https://grafana.example/d/payment-api
```

**Step 2 — Confirm route selection**

Alertmanager chooses the most specific matching child route. For ServiceNow delivery, verify that the alert labels satisfy the ServiceNow route matchers and that `continue` is set appropriately.

```text
Incoming alert labels
  severity=critical
  environment=production
  notification_target=servicenow
        │
        ▼
Match servicenow-sns-bridge route?
        │
        ├── yes ──► webhook to SNS publisher
        └── no  ──► fall through to default receiver
```

If the alert lands on `default-receiver`, the labels are incomplete or incorrect. Fix the Prometheus rule labels before changing Alertmanager.

**Step 3 — Confirm receiver settings**

The ServiceNow receiver must:

- Point at the SNS publisher webhook URL.
- Set `send_resolved: true` so resolution updates reach ServiceNow.
- Remain reachable from Alertmanager inside the cluster.

```yaml
receivers:
  - name: servicenow-sns-bridge
    webhook_configs:
      - url: http://alert-sns-publisher.monitoring.svc.cluster.local:8080/alerts
        send_resolved: true
```

**Step 4 — Confirm grouping still makes sense**

New alerts inherit the parent route's `group_by` unless a child route overrides it. With the recommended grouping:

```yaml
group_by:
  - alertname
  - service
  - environment
  - cluster
```

`PaymentApiHighLatency` is grouped separately from `PaymentApiHighErrorRate` because `alertname` differs, which is usually correct. If two different alert names should update the same ServiceNow incident, that must be handled by correlation-key design in the SNS integration, not by collapsing unrelated Alertmanager groups casually.

**Step 5 — Validate end to end**

1. Force the alert condition in a non-production rehearsal, or temporarily lower the threshold in a controlled test.
2. Confirm the alert appears as pending, then firing, in Prometheus.
3. Confirm Alertmanager shows the alert under the `servicenow-sns-bridge` receiver.
4. Confirm the SNS publisher receives one grouped webhook.
5. Confirm ServiceNow creates or updates one incident for the correlation key.
6. Clear the condition and confirm a resolved notification updates the same incident.

### 8.5.4 Adding a new route for a different destination

When a new alert family should go somewhere other than ServiceNow, add a dedicated route and receiver rather than overloading the ServiceNow bridge.

Example: send payment-team warning alerts to a team webhook, while critical production alerts continue to ServiceNow.

```yaml
route:
  receiver: default-receiver

  group_by:
    - alertname
    - service
    - environment
    - cluster

  routes:
    # Highest-priority ServiceNow path
    - receiver: servicenow-sns-bridge
      matchers:
        - severity="critical"
        - environment="production"
        - notification_target="servicenow"
      continue: false

    # Team notification path for warnings
    - receiver: payments-team-webhook
      matchers:
        - team="payments"
        - severity="warning"
      continue: false

receivers:
  - name: default-receiver

  - name: servicenow-sns-bridge
    webhook_configs:
      - url: http://alert-sns-publisher.monitoring.svc.cluster.local:8080/alerts
        send_resolved: true

  - name: payments-team-webhook
    webhook_configs:
      - url: http://team-notifier.monitoring.svc.cluster.local:8080/payments
        send_resolved: true
```

Route order matters. Alertmanager evaluates child routes in order and uses the first match unless `continue: true` is set. Keep the ServiceNow route ahead of broader team routes so critical production alerts are not accidentally diverted.

### 8.5.5 Kubernetes `AlertmanagerConfig` equivalent

In clusters managed by the Prometheus Operator, the same routing can be expressed as an `AlertmanagerConfig` resource instead of editing the central Alertmanager secret directly.

```yaml
apiVersion: monitoring.coreos.com/v1alpha1
kind: AlertmanagerConfig
metadata:
  name: payment-api-servicenow
  namespace: monitoring
  labels:
    alertmanagerConfig: enabled
spec:
  route:
    receiver: sns-publisher
    groupBy:
      - alertname
      - service
      - environment
      - cluster
    matchers:
      - name: severity
        value: critical
        matchType: "="
      - name: environment
        value: production
        matchType: "="
      - name: notification_target
        value: servicenow
        matchType: "="
  receivers:
    - name: sns-publisher
      webhookConfigs:
        - url: http://alert-sns-publisher.monitoring.svc.cluster.local:8080/alerts
          sendResolved: true
```

The Alertmanager instance must select this resource through its label selectors. If the resource is created but not selected, the new route never becomes active.

### 8.5.6 Configuration checklist for a new alert

| Check | Expected result |
|---|---|
| Prometheus rule exists and is selected | Rule visible in Prometheus `/rules` |
| Required routing labels are set | `severity`, `environment`, `notification_target` present |
| Required incident labels are set | `service`, `team`, `cluster`, and related fields present |
| Annotations are complete | `summary`, `description`, `runbook_url` present |
| Existing ServiceNow route matches | Alert appears on `servicenow-sns-bridge` |
| New destination needed? | Only then add route + receiver |
| `send_resolved: true` | Resolution events reach the bridge |
| Grouping is acceptable | One operational problem maps to one notification group |
| End-to-end test passed | One firing incident and one resolution update in ServiceNow |

### 8.5.7 Common mistakes

- Changing Alertmanager for every new `alertname` instead of setting the standard labels on the Prometheus rule.
- Setting `notification_target: servicenow` on non-production alerts, which can create unwanted tickets if environment matchers are missing.
- Putting routing information only in annotations. Alertmanager matchers use labels, not annotations.
- Adding a broad new route above the ServiceNow route so critical alerts stop reaching SNS.
- Forgetting `send_resolved: true`, which leaves ServiceNow incidents open after recovery.
- Assuming a new `AlertmanagerConfig` is active without verifying that Alertmanager selects it.

---

# 9. Alertmanager-to-SNS integration

## 9.1 Integration requirement

Alertmanager does not generally publish directly to SNS through a standard native SNS receiver.

A bridge component is therefore required:

```text
Alertmanager webhook
        │
        ▼
SNS publisher service
        │
        ▼
SNS topic
```

The bridge can be implemented as:

1. A small Kubernetes service.
2. An API Gateway endpoint backed by Lambda.
3. A supported Alertmanager SNS adapter.
4. An organisation-specific notification gateway.

The bridge shall expose an HTTP endpoint accepted by Alertmanager and call the SNS `Publish` operation.

SNS `Publish` sends a message to a topic, after which SNS delivers it to the topic’s subscribed endpoints. citeturn418752search23

## 9.2 Responsibilities of the bridge

The bridge shall:

1. Accept Alertmanager webhook payloads.
2. Validate the request.
3. Extract common and per-alert labels.
4. Generate a stable correlation key.
5. Convert the alert into the canonical organisation alert schema.
6. Publish the canonical payload to SNS.
7. Return an appropriate HTTP status to Alertmanager.
8. Emit its own metrics and structured logs.
9. Avoid logging credentials or sensitive payload fields.

## 9.3 Alertmanager webhook input

A simplified Alertmanager webhook payload resembles:

```json
{
  "version": "4",
  "groupKey": "{}:{alertname=\"PaymentApiHighErrorRate\",service=\"payment-api\"}",
  "status": "firing",
  "receiver": "servicenow-sns-bridge",
  "groupLabels": {
    "alertname": "PaymentApiHighErrorRate",
    "service": "payment-api",
    "environment": "production"
  },
  "commonLabels": {
    "alertname": "PaymentApiHighErrorRate",
    "severity": "critical",
    "team": "payments",
    "service": "payment-api",
    "environment": "production",
    "cluster": "prod-eks-01"
  },
  "commonAnnotations": {
    "summary": "Payment API error rate is above 5%",
    "description": "The Payment API has returned more than 5% HTTP 5xx responses.",
    "runbook_url": "https://internal.example/runbooks/payment-api-high-error-rate"
  },
  "alerts": [
    {
      "status": "firing",
      "labels": {
        "alertname": "PaymentApiHighErrorRate",
        "service": "payment-api",
        "environment": "production",
        "cluster": "prod-eks-01"
      },
      "annotations": {
        "summary": "Payment API error rate is above 5%"
      },
      "startsAt": "2026-07-24T18:15:00Z",
      "endsAt": "0001-01-01T00:00:00Z",
      "generatorURL": "https://prometheus.example/graph?g0.expr=..."
    }
  ]
}
```

## 9.4 Canonical SNS message schema

The bridge shall convert the Alertmanager payload into a stable schema that is independent of Alertmanager implementation details.

```json
{
  "schemaVersion": "1.0",
  "eventId": "a56494d8-e523-49e8-a2a7-aac9c86fd613",
  "eventType": "ALERT_FIRING",
  "source": "prometheus-alertmanager",
  "occurredAt": "2026-07-24T18:15:00Z",
  "publishedAt": "2026-07-24T18:15:33Z",

  "correlationKey": "production:payment-api:PaymentApiHighErrorRate:prod-eks-01",

  "alert": {
    "name": "PaymentApiHighErrorRate",
    "status": "firing",
    "severity": "critical",

    "summary": "Payment API error rate is above 5%",

    "description": "The Payment API has returned more than 5% HTTP 5xx responses for at least ten minutes.",

    "startedAt": "2026-07-24T18:15:00Z",
    "resolvedAt": null
  },

  "resource": {
    "application": "payments",
    "service": "payment-api",
    "environment": "production",
    "awsAccountId": "123456789012",
    "awsRegion": "eu-west-2",
    "cluster": "prod-eks-01",
    "namespace": "payments"
  },

  "ownership": {
    "team": "payments",
    "assignmentGroup": "Payments Platform Support"
  },

  "links": {
    "runbook": "https://internal.example/runbooks/payment-api-high-error-rate",
    "dashboard": "https://grafana.example/d/payment-api",
    "prometheus": "https://prometheus.example/graph?g0.expr=..."
  },

  "integration": {
    "alertmanagerReceiver": "servicenow-sns-bridge",
    "alertmanagerGroupKey": "{}:{alertname=\"PaymentApiHighErrorRate\",service=\"payment-api\"}"
  }
}
```

## 9.5 Correlation key

The correlation key is central to duplicate prevention.

Recommended construction:

```text
environment
+ service
+ alertname
+ cluster
+ optional resource identifier
```

Example:

```text
production:payment-api:PaymentApiHighErrorRate:prod-eks-01
```

The correlation key must:

- Remain constant while the same condition is firing.
- Be present in firing, repeat and resolved messages.
- Avoid volatile fields such as timestamps or pod names unless each pod genuinely requires a separate incident.
- Be stored in a dedicated ServiceNow field.

A hash may also be used:

```text
SHA-256(environment|service|alertname|cluster)
```

---

# 10. SNS configuration

## 10.1 Topic

A dedicated SNS topic shall be created, for example:

```text
arn:aws:sns:eu-west-2:123456789012:production-monitoring-servicenow-alerts
```

Production and non-production should use separate topics:

```text
production-monitoring-servicenow-alerts
nonproduction-monitoring-servicenow-alerts
```

## 10.2 Publisher permission

The SNS publisher component shall have only the ability to publish to the required topic:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublishServiceNowAlerts",
      "Effect": "Allow",
      "Action": "sns:Publish",
      "Resource": "arn:aws:sns:eu-west-2:123456789012:production-monitoring-servicenow-alerts"
    }
  ]
}
```

## 10.3 Topic policy

The topic policy shall limit publishing to the approved IAM role.

Conceptually:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowApprovedAlertPublisher",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:role/alert-sns-publisher"
      },
      "Action": "sns:Publish",
      "Resource": "arn:aws:sns:eu-west-2:123456789012:production-monitoring-servicenow-alerts"
    }
  ]
}
```

## 10.4 Encryption

The topic shall use server-side encryption with an AWS KMS key where organisational policy requires it.

The publishing and consuming roles must receive the necessary KMS permissions.

## 10.5 Message attributes

The publisher should add SNS message attributes:

```text
eventType        = ALERT_FIRING
severity         = critical
environment      = production
service          = payment-api
schemaVersion    = 1.0
```

These enable SNS subscription filter policies.

Example subscription filter:

```json
{
  "severity": ["critical"],
  "environment": ["production"]
}
```

## 10.6 Delivery mechanism

SNS supports delivery to subscribed endpoints, including HTTP and HTTPS endpoints. For an HTTPS subscription, SNS issues an HTTP POST to the endpoint. citeturn418752search16turn418752search32

However, a direct SNS-to-ServiceNow HTTPS subscription is often less flexible than using a Lambda or SQS-based integration.

The preferred architecture is:

```text
SNS
 │
 ▼
SQS queue
 │
 ▼
Lambda or integration worker
 │
 ▼
ServiceNow REST API
```

This provides stronger buffering, replay, controlled retries and dead-letter handling.

A simpler architecture is:

```text
SNS
 │
 ▼
Lambda
 │
 ▼
ServiceNow REST API
```

---

# 11. ServiceNow integration component

## 11.1 Responsibilities

The ServiceNow consumer shall:

1. Receive the SNS event.
2. Validate the SNS envelope and inner alert schema.
3. Confirm that the message is allowed to create an incident.
4. Search ServiceNow for an active incident using the correlation key.
5. Create an incident when no matching active incident exists.
6. Update the existing incident when one exists.
7. Resolve or close the incident when a resolved message arrives.
8. Persist processing state where necessary.
9. Return or record a clear processing result.
10. Send failed messages to a dead-letter queue after retry exhaustion.

## 11.2 ServiceNow API

ServiceNow supports creating an incident through the Table API by issuing a POST against the incident table. citeturn418752search8turn418752search35

Conceptual endpoint:

```text
POST /api/now/table/incident
```

Typical headers:

```http
Accept: application/json
Content-Type: application/json
Authorization: Bearer <token>
```

Authentication may use:

- OAuth 2.0.
- A ServiceNow integration user.
- Mutual TLS where supported by the organisation.
- A credential stored in AWS Secrets Manager.

OAuth or another short-lived token mechanism should be preferred over embedding a username and password.

---

# 12. ServiceNow incident mapping

## 12.1 Firing alert mapping

Example incident request:

```json
{
  "short_description": "[CRITICAL] Payment API error rate is above 5%",

  "description": "The Payment API has returned more than 5% HTTP 5xx responses for at least ten minutes.\n\nEnvironment: production\nService: payment-api\nCluster: prod-eks-01\nAlert: PaymentApiHighErrorRate\nStarted: 2026-07-24T18:15:00Z\n\nRunbook: https://internal.example/runbooks/payment-api-high-error-rate\nDashboard: https://grafana.example/d/payment-api",

  "category": "software",
  "subcategory": "application",

  "impact": "1",
  "urgency": "1",

  "assignment_group": "Payments Platform Support",

  "configuration_item": "payment-api-production",

  "correlation_id": "production:payment-api:PaymentApiHighErrorRate:prod-eks-01",

  "contact_type": "monitoring",

  "comments": "Incident created automatically from Prometheus Alertmanager."
}
```

Actual field names, accepted values and custom fields must be confirmed against the organisation’s ServiceNow data model.

## 12.2 Suggested field mapping

| Alert field | ServiceNow field |
|---|---|
| `alert.summary` | `short_description` |
| `alert.description` | `description` |
| `alert.severity` | `impact` and `urgency` |
| `ownership.assignmentGroup` | `assignment_group` |
| `resource.service` | `configuration_item` or custom service field |
| `correlationKey` | `correlation_id` or custom correlation field |
| `links.runbook` | Description or custom URL field |
| `links.dashboard` | Description or custom URL field |
| `alert.startedAt` | Custom alert start field |
| `source` | `contact_type` or custom source field |

## 12.3 Severity mapping

An example mapping is:

| Prometheus severity | Impact | Urgency | ServiceNow priority |
|---|---:|---:|---|
| `critical` | 1 | 1 | P1 |
| `high` | 1 | 2 | P2 |
| `warning` | 2 | 2 | P3 |
| `info` | 3 | 3 | P4 |

ServiceNow priority is commonly derived from impact and urgency. The organisation’s priority matrix remains authoritative.

Not every Prometheus `critical` alert should necessarily create a P1 incident. P1 classification may require additional conditions such as:

- Production only.
- Customer-visible outage.
- Multiple availability zones affected.
- Revenue-impacting transaction failure.
- No functioning failover.

---

# 13. Incident correlation algorithm

## 13.1 Firing event

For an `ALERT_FIRING` event:

```text
1. Validate message.
2. Extract correlationKey.
3. Query ServiceNow for an active incident with that correlationKey.
4. If no incident exists:
       create incident.
5. If an active incident exists:
       add a work note or update alert details.
6. Record the ServiceNow incident number and sys_id.
7. Mark event as processed.
```

Pseudo-flow:

```text
ALERT_FIRING
     │
     ▼
Find active incident by correlation key
     │
     ├── Not found ─► Create incident
     │
     └── Found ─────► Update existing incident
```

## 13.2 Resolved event

For an `ALERT_RESOLVED` event:

```text
1. Validate message.
2. Extract correlationKey.
3. Find active incident.
4. If found:
       add resolution work note;
       set resolution code;
       set resolution notes;
       transition incident according to policy.
5. If not found:
       record as an orphan resolution;
       do not create a new incident.
```

Whether the ticket is automatically resolved should be a business decision.

A safer model is:

```text
Resolved alert
    │
    ▼
Set incident to "Resolved - Monitoring condition cleared"
    │
    ▼
ServiceNow auto-closes after configured validation period
```

For high-risk services, the integration may only add a work note and leave resolution to support staff.

---

# 14. Idempotency

SNS and downstream consumers should be treated as providing **at-least-once processing**, meaning the same event may be observed more than once.

The consumer shall therefore be idempotent.

## 14.1 Event-level idempotency

Each message shall include an `eventId`.

The integration may store processed event IDs in DynamoDB:

```text
Partition key: eventId
TTL: 7 days
```

Before processing:

```text
if eventId already exists:
    acknowledge event
    perform no ServiceNow change
else:
    atomically record eventId
    process event
```

## 14.2 Alert-level idempotency

Even when `eventId` changes for repeated firing notifications, the same `correlationKey` shall map to the same active ServiceNow incident.

Therefore:

```text
eventId        prevents reprocessing the exact event
correlationKey prevents duplicate incidents for the same alert condition
```

Both are required.

---

# 15. Resolution behaviour

Alertmanager must be configured with:

```yaml
send_resolved: true
```

When the Prometheus expression becomes false, Alertmanager sends a resolved notification.

The SNS canonical event should then contain:

```json
{
  "eventType": "ALERT_RESOLVED",
  "correlationKey": "production:payment-api:PaymentApiHighErrorRate:prod-eks-01",
  "alert": {
    "name": "PaymentApiHighErrorRate",
    "status": "resolved",
    "startedAt": "2026-07-24T18:15:00Z",
    "resolvedAt": "2026-07-24T18:43:30Z"
  }
}
```

The integration shall use the same correlation key to locate the existing incident.

---

# 16. Failure and retry handling

## 16.1 Alertmanager to publisher failure

If the SNS publisher returns a non-successful HTTP response, Alertmanager may retry according to its notification logic.

The publisher shall return:

| Response | Meaning |
|---|---|
| `2xx` | Message accepted and published to SNS |
| `400` | Invalid request; retry is unlikely to succeed |
| `401/403` | Authentication or authorisation failure |
| `429` | Throttled; retry |
| `500/503` | Temporary failure; retry |

A success response must only be returned after SNS has accepted the message.

## 16.2 SNS consumer failure

Recommended:

```text
SNS
 │
 ▼
SQS queue
 │
 ▼
Integration worker
 │
 ├── success ─► delete message
 │
 └── failure ─► retry
                  │
                  ▼
                DLQ
```

Example retry policy:

```text
Visibility timeout: 2 minutes
Maximum receive count: 5
Dead-letter queue retention: 14 days
```

## 16.3 ServiceNow failures

The consumer shall retry:

- HTTP `429`.
- HTTP `500`.
- HTTP `502`.
- HTTP `503`.
- HTTP `504`.
- Network timeouts.
- Temporary DNS failures.

It should not repeatedly retry without correction for:

- HTTP `400`.
- Invalid field values.
- Invalid assignment group.
- Schema validation failure.
- Permanently rejected credentials.

Authentication failures should raise a separate platform alert.

## 16.4 Dead-letter messages

A dead-letter message shall retain:

```text
eventId
correlationKey
original SNS message
failure reason
HTTP status
retry count
first failure timestamp
last failure timestamp
```

An alert shall exist for messages entering the DLQ.

---

# 17. Monitoring the monitoring pipeline

The integration itself must be monitored.

## 17.1 SNS publisher metrics

The publisher should expose:

```text
alert_sns_publish_requests_total
alert_sns_publish_success_total
alert_sns_publish_failures_total
alert_sns_publish_duration_seconds
alert_payload_validation_failures_total
```

## 17.2 ServiceNow consumer metrics

The consumer should expose:

```text
servicenow_incident_create_total
servicenow_incident_update_total
servicenow_incident_resolve_total
servicenow_api_requests_total
servicenow_api_failures_total
servicenow_api_duration_seconds
servicenow_duplicate_events_total
servicenow_orphan_resolutions_total
servicenow_dlq_messages_total
```

## 17.3 Required integration alerts

At minimum:

```text
SNS publisher unable to publish
ServiceNow API unavailable
ServiceNow authentication failing
Consumer queue depth above threshold
Oldest queue message above threshold
Messages present in DLQ
No successful alert processing during expected test period
YACE scrape failing
Prometheus unable to reach Alertmanager
Alertmanager notification failures
```

The monitoring pipeline must not depend exclusively on itself for notification. For example, failures in the ServiceNow path should also notify a separate channel.

---

# 18. Security requirements

## 18.1 Authentication and credentials

- Kubernetes workloads shall use IAM roles rather than static AWS keys.
- ServiceNow credentials shall be stored in AWS Secrets Manager or another approved secret store.
- Secrets shall not be included in Kubernetes ConfigMaps.
- Secrets shall not appear in application logs.
- Tokens shall be rotated.
- The ServiceNow integration user shall have only the necessary incident API permissions.

## 18.2 Network controls

Where possible:

- Kubernetes NetworkPolicies shall restrict access to the SNS publisher.
- The publisher endpoint shall only accept traffic from Alertmanager.
- The ServiceNow consumer shall use TLS.
- Private AWS endpoints should be used where available.
- Egress shall be limited to SNS, ServiceNow and required AWS APIs.

## 18.3 Payload controls

Alert payloads shall not contain:

- Customer payment data.
- Authentication tokens.
- Passwords.
- Full request bodies.
- Personally identifiable information.
- Secrets from exception messages.

Descriptions should contain operational context, not sensitive application content.

## 18.4 Auditability

Each stage shall log:

```text
eventId
correlationKey
alertName
status
service
environment
SNS message ID
ServiceNow incident number
processing result
```

Logs must not include ServiceNow access tokens or secret values.

---

# 19. Availability and scaling requirements

## 19.1 Alertmanager

For production:

- Run multiple Alertmanager replicas.
- Configure the replicas as a cluster.
- Configure Prometheus to send alerts to all Alertmanager instances.
- Use persistent storage where required.
- Apply PodDisruptionBudgets.
- Spread replicas across nodes or availability zones.

## 19.2 SNS publisher

The publisher shall:

- Run at least two replicas for high availability, where applicable.
- Be stateless.
- Use readiness and liveness probes.
- Support graceful shutdown.
- Apply request timeouts.
- Limit maximum request body size.
- Validate Alertmanager payload versions.

## 19.3 ServiceNow consumer

The consumer shall scale using:

- SQS queue depth.
- Approximate age of oldest message.
- CPU or concurrency.
- ServiceNow API rate limits.

Scaling must not exceed ServiceNow’s allowed API throughput.

---

# 20. Adding a new metric-based alert

This section is the operational procedure for introducing a **new alert based on a new metric** in this architecture. It covers the full path from metric creation to ServiceNow incident behaviour.

```text
1. Choose metric source
2. Create / expose the metric
3. Make Prometheus scrape it
4. Verify the metric in Prometheus
5. Define the PrometheusRule
6. Confirm Alertmanager routing labels
7. Add runbook and dashboard links
8. Package the change in Helm values / templates
9. Test pending → firing → resolved
10. Confirm one ServiceNow incident, then resolution
11. Enable in production
```

SNS, SQS, IAM and the ServiceNow consumer normally do **not** need changes for each new alert. Those components already key off labels and the correlation key.

## 20.1 Step 1 — Choose the metric source

Decide where the signal comes from:

| Source | Use when | Path into Prometheus |
|---|---|---|
| Application Prometheus metric | The app can observe the failure directly | App `/metrics` → ServiceMonitor → Prometheus |
| CloudWatch metric via YACE | The signal is an AWS service metric | CloudWatch → YACE → Prometheus |
| Log-derived CloudWatch metric | The signal only exists in logs today | Logs → metric filter → CloudWatch → YACE → Prometheus |

Do not scrape raw logs into Prometheus. Convert log events to metrics first when needed.

Example decision:

```text
Need: alert when payment checkout dependency fails repeatedly
        │
        ├── App already counts dependency failures?
        │     └── yes → add / reuse application counter
        │
        ├── AWS ALB / RDS / SQS already exposes the signal?
        │     └── yes → export through YACE
        │
        └── Only visible in ERROR logs today?
              └── create CloudWatch Logs metric filter, then YACE
```

## 20.2 Step 2 — Create or expose the metric

### Application metric example

Instrument a stable, low-cardinality metric:

```text
payment_checkout_dependency_failures_total{
  application="payments",
  service="payment-api",
  environment="production",
  cluster="prod-eks-01",
  namespace="payments",
  dependency="fraud-service",
  outcome="error"
}
```

Requirements:

- Use a clear metric name and unit convention.
- Include identity labels: `application`, `service`, `environment`, `cluster`, `namespace`.
- Avoid high-cardinality labels such as `user_id`, `request_id`, `transaction_id` or full URLs.
- Expose it on the existing Prometheus endpoint, for example `/actuator/prometheus`.
- Prefer counters or histograms that support `rate()` / `increase()` in PromQL.

### CloudWatch / YACE metric example

If the signal is AWS-native, configure YACE to discover and export it, including the tags needed for alert routing:

```yaml
# conceptual YACE addition
- type: AWS/ApplicationELB
  regions:
    - eu-west-2
  metrics:
    - name: UnHealthyHostCount
      statistics:
        - Maximum
  dimensionNameRequirements:
    - LoadBalancer
  # ensure Environment / Application tags are available as labels
```

If starting from logs, first create a CloudWatch Logs metric filter, then export that custom metric through YACE.

## 20.3 Step 3 — Ensure Prometheus scrapes the metric

### Application path

Confirm a `ServiceMonitor` already scrapes the application. If the app is new to scraping, add one:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: payment-api
  namespace: payments
  labels:
    release: kube-prometheus-stack
spec:
  selector:
    matchLabels:
      app: payment-api
  namespaceSelector:
    matchNames:
      - payments
  endpoints:
    - port: http
      path: /actuator/prometheus
      interval: 30s
```

### YACE path

Confirm:

1. YACE is configured for the CloudWatch namespace/metric.
2. A ServiceMonitor scrapes YACE.
3. The Prometheus instance selects that ServiceMonitor.
4. IAM permissions allow CloudWatch `GetMetricData` / `ListMetrics` as required.

No Alertmanager or ServiceNow change is needed at this step.

## 20.4 Step 4 — Verify the metric before writing the alert

In Prometheus, confirm the metric exists and has the expected labels:

```promql
payment_checkout_dependency_failures_total
```

or, for YACE:

```promql
aws_applicationelb_un_healthy_host_count_maximum
```

Checks:

- Target is `UP` in Prometheus.
- Series appear for the intended service/environment.
- Label names match what the future alert will group and route on.
- A manual PromQL threshold query returns sensible values during normal and failure conditions.

Do not create the alert until the metric is visible and trusted.

## 20.5 Step 5 — Define the Prometheus alerting rule

Add a `PrometheusRule` (or extend an existing group) with:

- a boolean PromQL threshold expression;
- a `for` duration to absorb transient spikes;
- routing and incident labels;
- human-readable annotations.

Example for the new application metric:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: payment-api-checkout-dependency-alerts
  namespace: monitoring
  labels:
    release: kube-prometheus-stack
spec:
  groups:
    - name: payment-api.checkout.rules
      interval: 30s
      rules:
        - alert: PaymentCheckoutDependencyFailuresHigh

          expr: |
            sum by (application, service, environment, cluster, namespace, dependency) (
              rate(
                payment_checkout_dependency_failures_total{
                  application="payments",
                  service="payment-api",
                  outcome="error"
                }[5m]
              )
            ) > 0.2

          for: 10m

          labels:
            severity: critical
            environment: production
            notification_target: servicenow
            service: payment-api
            application: payments
            team: payments

          annotations:
            summary: "Payment checkout dependency failures are elevated"

            description: |
              Dependency {{ $labels.dependency }} for payment-api is failing
              at more than 0.2 errors/second over five minutes.

            runbook_url: |
              https://internal.example/runbooks/payment-checkout-dependency-failures

            dashboard_url: |
              https://grafana.example/d/payment-api
```

Expression guidance:

- Return series only when action is required (`> threshold`), not a bare rate.
- Keep `sum by (...)` labels aligned with incident identity.
- Choose `for` long enough to avoid tickets for brief blips; ten minutes is a common starting point for ServiceNow-bound alerts.

## 20.6 Step 6 — Wire Alertmanager without unnecessary edits

Alertmanager routes on labels, not on metric names or alert names.

For ServiceNow delivery, the new alert must include:

```text
severity=critical
environment=production
notification_target=servicenow
```

If those labels match the existing ServiceNow route, **do not change Alertmanager**.

Change Alertmanager only if this alert needs:

- a different destination;
- different grouping;
- different repeat behaviour;
- an inhibition relationship with another alert.

See §8.5 for route and receiver changes when they are required.

## 20.7 Step 7 — Confirm correlation and ServiceNow mapping

The SNS publisher builds a correlation key such as:

```text
environment:service:alertname:cluster
```

Example for this alert:

```text
production:payment-api:PaymentCheckoutDependencyFailuresHigh:prod-eks-01
```

Implications:

- Keep `service`, `environment`, `alertname` and `cluster` stable.
- Do not put pod name or timestamp into the correlation identity unless each instance truly needs its own incident.
- If `dependency` should create separate incidents per dependency, the publisher/correlation design must include that label deliberately; otherwise multiple dependencies may share one incident depending on grouping and key construction.

No ServiceNow workflow change is required if existing severity → priority and team → assignment-group mappings already cover `severity: critical` and `team: payments`.

## 20.8 Step 8 — Package through Helm

Prefer making the alert configurable through chart values rather than hard-coding production thresholds only in manifests.

Example values addition:

```yaml
alerts:
  enabled: true
  rules:
    paymentCheckoutDependencyFailuresHigh:
      enabled: true
      threshold: 0.2
      evaluationWindow: 5m
      pendingDuration: 10m
      severity: critical
```

Then render the `PrometheusRule` from those values in the Helm template, as shown in the Prometheus rule templating section.

Also update, if needed:

- application chart / code that exposes the metric;
- YACE values, when the metric is CloudWatch-derived;
- ServiceMonitor values, when scraping is new.

AWS resources (SNS topic, SQS, IAM) usually remain unchanged.

## 20.9 Step 9 — Test the full pipeline

Test in a non-production environment first, using a separate SNS topic where possible.

| Stage | What to verify |
|---|---|
| Metric | New series visible in Prometheus |
| Rule | Alert listed under Prometheus `/rules` |
| Pending | Condition true briefly → state `Pending` |
| Firing | Condition true for `for` duration → state `Firing` |
| Alertmanager | Alert appears on `servicenow-sns-bridge` |
| SNS publisher | Canonical event published with stable `correlationKey` |
| ServiceNow | One incident created on first firing event |
| Repeat | Later firing notifications update the same incident |
| Resolved | Clearing the condition resolves/updates the same incident |

Suggested controlled test approach:

1. Temporarily lower the threshold or inject synthetic failures.
2. Wait through `for`.
3. Confirm one ticket, not one ticket per evaluation cycle.
4. Restore normal behaviour and confirm resolution handling.
5. Remove any temporary threshold overrides before production enablement.

## 20.10 Step 10 — Operational readiness

Before enabling in production:

- Runbook exists and is linked from `runbook_url`.
- Dashboard panel exists for the new metric.
- On-call / assignment group mapping for `team` is correct.
- Alert severity is justified for ServiceNow; warnings should normally stay off the ServiceNow route.
- Cardinality impact of the new metric is acceptable.
- Silences or maintenance windows are understood for the first rollout window.

## 20.11 What normally does not change

For a standard new metric alert in this architecture, leave these alone unless there is a new requirement:

| Component | Usually unchanged? |
|---|---|
| Alertmanager receivers | Yes |
| SNS topic / queue | Yes |
| SNS publisher code | Yes |
| ServiceNow consumer code | Yes |
| IAM roles | Yes |
| Incident correlation algorithm | Yes |

Change those only when introducing a new notification destination, payload schema change, or correlation-key design change.

## 20.12 End-to-end checklist

```text
[ ] Metric source chosen (app / YACE / log-derived)
[ ] Metric exposed with stable low-cardinality labels
[ ] Prometheus scrapes the target successfully
[ ] Metric verified with PromQL
[ ] PrometheusRule added with threshold + for
[ ] Labels include severity, environment, notification_target, service, team
[ ] Annotations include summary, description, runbook_url, dashboard_url
[ ] Existing Alertmanager ServiceNow route matches
[ ] Helm values / templates updated
[ ] Non-production firing test created one ServiceNow incident
[ ] Repeat notification updated the same incident
[ ] Resolution updated/resolved the same incident
[ ] Production enablement approved
```

---

# 21. End-to-end sequence

## 21.1 Firing sequence

```text
1. Payment API begins returning HTTP 500 responses.

2. The application increments:
   http_server_requests_seconds_count{status="500"}.

3. Prometheus scrapes the application metrics endpoint.

4. Prometheus evaluates:
   error rate > 5%.

5. The expression remains true for ten minutes.

6. The alert changes:
   Pending → Firing.

7. Prometheus sends the firing alert to Alertmanager.

8. Alertmanager:
   - groups the alert;
   - checks silences;
   - applies inhibition rules;
   - selects the ServiceNow route.

9. Alertmanager sends a webhook request to the SNS publisher.

10. The publisher:
    - validates the payload;
    - constructs the correlation key;
    - maps it to the canonical schema;
    - publishes it to SNS.

11. SNS accepts the message and delivers it to the subscribed
    queue, Lambda or HTTPS endpoint.

12. The ServiceNow consumer receives the message.

13. The consumer searches ServiceNow using the correlation key.

14. No active incident is found.

15. The consumer creates an incident.

16. ServiceNow returns:
    - incident number;
    - sys_id.

17. The consumer stores or logs the mapping.

18. Support personnel receive and process the incident.
```

## 21.2 Repeat sequence

```text
1. The alert remains firing.
2. Alertmanager reaches repeat_interval.
3. Another firing message is published.
4. The consumer finds the existing incident by correlation key.
5. The incident is updated.
6. No duplicate incident is created.
```

## 21.3 Resolution sequence

```text
1. The application recovers.
2. The Prometheus alert expression becomes false.
3. Prometheus marks the alert resolved.
4. Alertmanager sends a resolved notification.
5. The SNS publisher emits ALERT_RESOLVED.
6. The consumer finds the incident using the same correlation key.
7. The incident receives a resolution note.
8. The incident is resolved automatically or queued for manual confirmation.
```

---

# 22. Acceptance criteria

The implementation shall be accepted when all of the following are demonstrated.

## Metric collection

- Application metrics are visible in Prometheus.
- YACE metrics are visible in Prometheus.
- Prometheus reports both targets as healthy.
- CloudWatch-derived metrics contain the expected AWS resource labels.

## Alerting

- A test condition places an alert into `Pending`.
- The alert enters `Firing` after the configured duration.
- Alertmanager receives the alert.
- The expected Alertmanager route is selected.
- Silenced alerts do not create ServiceNow incidents.

## SNS

- The publisher successfully publishes the canonical event.
- The event includes a stable correlation key.
- SNS message attributes are present.
- Unauthorised publishers cannot publish to the topic.
- Encrypted topic delivery operates successfully.

## ServiceNow

- The first firing event creates one incident.
- A repeated firing event updates the same incident.
- Multiple Alertmanager evaluations do not create duplicate incidents.
- A resolved event updates or resolves the correct incident.
- An orphan resolved event does not create a new incident.
- Severity, assignment group and service mappings are correct.

## Resilience

- Temporary ServiceNow failures cause retries.
- Permanent failures are sent to the DLQ.
- A DLQ alert is raised.
- Replaying a message does not create a duplicate incident.
- SNS or ServiceNow authentication failures generate platform alerts.

---

# 23. Recommended target design

The strongest implementation is:

```text
Application metrics ──────────────┐
                                  │
CloudWatch Logs                   │
    │                             │
    └── Metric filters            │
           │                      │
           ▼                      │
CloudWatch Metrics                │
           │                      │
           ▼                      │
          YACE                    │
           │                      │
           └──────────────────────┤
                                  ▼
                              Prometheus
                                  │
                         PrometheusRule
                                  │
                                  ▼
                             Alertmanager
                                  │
                              Webhook
                                  │
                                  ▼
                          SNS Publisher
                                  │
                                  ▼
                              SNS Topic
                                  │
                                  ▼
                              SQS Queue
                                  │
                                  ▼
                    ServiceNow Integration Worker
                                  │
                                  ▼
                  ServiceNow Incident Table API
```

This design provides:

- Clear separation of responsibilities.
- Stable alert payload contracts.
- Buffering between AWS and ServiceNow.
- Idempotent incident creation.
- Controlled retries.
- Dead-letter recovery.
- Independent scaling.
- Traceability from Prometheus alert to ServiceNow ticket.

The most important design rule is:

> Alertmanager notifications represent state changes, while the correlation key represents the continuing operational problem. ServiceNow incidents must be created and updated according to that correlation key, not according to the number of messages received.

Helm should become the **deployment and configuration layer** that packages the Kubernetes parts of this monitoring and ServiceNow integration.

The revised architecture is:

```text
Helm release
│
├── PrometheusRule
├── ServiceMonitor for application
├── ServiceMonitor for YACE
├── Alertmanager configuration
├── YACE configuration
├── SNS publisher Deployment
├── SNS publisher Service
├── ServiceAccount / AWS IAM association
├── ConfigMaps
├── ExternalSecret or secret reference
├── NetworkPolicy
├── PodDisruptionBudget
└── integration monitoring rules
```

AWS resources such as SNS, SQS, IAM roles and KMS keys would normally remain in Terraform or CloudFormation rather than being created directly by the Helm chart.

# 1. Deployment model

A clean separation would be:

```text
Terraform / CloudFormation
│
├── SNS topic
├── SQS queue
├── Dead-letter queue
├── IAM roles and policies
├── KMS key
├── AWS Secrets Manager secret
└── EKS Pod Identity / IRSA configuration
         │
         ▼
Helm
│
├── YACE deployment and configuration
├── ServiceMonitors
├── PrometheusRules
├── Alertmanager routing
├── SNS publisher
├── Kubernetes ServiceAccounts
└── Kubernetes security and availability resources
```

Helm should receive AWS resource identifiers as configuration:

```yaml
sns:
  topicArn: arn:aws:sns:eu-west-2:123456789012:production-monitoring-servicenow-alerts

aws:
  region: eu-west-2

serviceAccount:
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/alert-sns-publisher
```

This avoids Helm having to provision AWS infrastructure.

---

# 2. Recommended chart structure

A dedicated umbrella chart can wrap the complete solution:

```text
servicenow-alerting/
├── Chart.yaml
├── Chart.lock
├── values.yaml
├── values-production.yaml
├── values-nonproduction.yaml
├── templates/
│   ├── _helpers.tpl
│   ├── serviceaccount.yaml
│   ├── sns-publisher-deployment.yaml
│   ├── sns-publisher-service.yaml
│   ├── sns-publisher-configmap.yaml
│   ├── sns-publisher-servicemonitor.yaml
│   ├── application-servicemonitor.yaml
│   ├── yace-servicemonitor.yaml
│   ├── prometheusrule.yaml
│   ├── alertmanagerconfig.yaml
│   ├── networkpolicy.yaml
│   ├── poddisruptionbudget.yaml
│   ├── externalsecret.yaml
│   └── NOTES.txt
├── dashboards/
│   └── alerting-integration.json
└── charts/
```

There are two reasonable Helm approaches.

## Option A: One umbrella chart

The umbrella chart includes dependencies for:

* Prometheus Operator stack.
* YACE.
* The custom SNS publisher.
* ServiceNow integration configuration.

This is useful when the entire monitoring stack is owned and deployed together.

## Option B: Integration-only chart

The chart assumes Prometheus, Alertmanager and YACE already exist and only installs:

* Prometheus rules.
* ServiceMonitors.
* Alertmanager routing.
* SNS publisher.
* Security resources.

This is normally safer in an established platform because it does not couple application alerting to installation of the entire monitoring platform.

For your setup, I would favour **Option B** unless your team owns the whole Prometheus installation.

---

# 3. `Chart.yaml`

Example:

```yaml
apiVersion: v2

name: servicenow-alerting

description: >
  Prometheus, Alertmanager and AWS SNS integration
  for creating and updating ServiceNow incidents.

type: application

version: 1.0.0

appVersion: "1.0.0"

dependencies:
  - name: yet-another-cloudwatch-exporter
    alias: yace
    version: "x.y.z"
    repository: "https://prometheus-community.github.io/helm-charts"
    condition: yace.enabled
```

The dependency version should be pinned rather than using an unconstrained version.

If Prometheus is managed separately, `kube-prometheus-stack` should not be included as a dependency. The chart can simply create compatible custom resources such as:

```text
ServiceMonitor
PrometheusRule
AlertmanagerConfig
```

---

# 4. Main `values.yaml`

The values file should expose operational decisions while hiding Kubernetes implementation details.

```yaml
global:
  environment: production
  application: payments
  service: payment-api
  team: payments
  cluster: prod-eks-01
  awsAccountId: "123456789012"
  awsRegion: eu-west-2

serviceNow:
  enabled: true

  assignmentGroup: Payments Platform Support

  configurationItem: payment-api-production

  autoResolve: true

  severityMapping:
    critical:
      impact: "1"
      urgency: "1"

    high:
      impact: "1"
      urgency: "2"

    warning:
      impact: "2"
      urgency: "2"

sns:
  enabled: true

  topicArn: >
    arn:aws:sns:eu-west-2:123456789012:
    production-monitoring-servicenow-alerts

  messageSchemaVersion: "1.0"

  attributes:
    source: prometheus-alertmanager
    environment: production

snsPublisher:
  enabled: true

  replicaCount: 2

  image:
    repository: 123456789012.dkr.ecr.eu-west-2.amazonaws.com/alert-sns-publisher
    tag: "1.0.0"
    pullPolicy: IfNotPresent

  service:
    port: 8080

  resources:
    requests:
      cpu: 100m
      memory: 128Mi

    limits:
      cpu: 500m
      memory: 512Mi

  probes:
    liveness:
      path: /health/live
      initialDelaySeconds: 10
      periodSeconds: 10

    readiness:
      path: /health/ready
      initialDelaySeconds: 5
      periodSeconds: 5

  metrics:
    enabled: true
    path: /metrics
    port: 8080

serviceAccount:
  create: true

  name: alert-sns-publisher

  annotations:
    eks.amazonaws.com/role-arn: >
      arn:aws:iam::123456789012:
      role/production-alert-sns-publisher

prometheus:
  releaseLabel: kube-prometheus-stack

  serviceMonitor:
    enabled: true
    interval: 30s
    scrapeTimeout: 10s

alerts:
  enabled: true

  defaultLabels:
    notification_target: servicenow
    environment: production
    team: payments
    service: payment-api

  rules:
    paymentApiHighErrorRate:
      enabled: true
      severity: critical
      threshold: 0.05
      evaluationWindow: 5m
      pendingDuration: 10m

    unhealthyLoadBalancerTargets:
      enabled: true
      severity: critical
      threshold: 0
      pendingDuration: 5m

alertmanager:
  enabled: true

  route:
    groupBy:
      - alertname
      - service
      - environment
      - cluster

    groupWait: 30s
    groupInterval: 5m
    repeatInterval: 4h

  sendResolved: true

applicationMetrics:
  enabled: true

  namespace: payments

  selector:
    app: payment-api

  endpoint:
    port: management
    path: /actuator/prometheus
    interval: 30s

yace:
  enabled: true

  serviceMonitor:
    enabled: true

  config:
    apiVersion: v1alpha1

    discovery:
      jobs:
        - type: AWS/ApplicationELB

          regions:
            - eu-west-2

          searchTags:
            - key: Environment
              value: production

            - key: Application
              value: payments

          period: 300
          length: 600
          delay: 120

          metrics:
            - name: HTTPCode_Target_5XX_Count
              statistics:
                - Sum

            - name: UnHealthyHostCount
              statistics:
                - Maximum

security:
  networkPolicy:
    enabled: true

  podSecurityContext:
    runAsNonRoot: true
    runAsUser: 10001
    fsGroup: 10001

  containerSecurityContext:
    allowPrivilegeEscalation: false
    readOnlyRootFilesystem: true
    capabilities:
      drop:
        - ALL

podDisruptionBudget:
  enabled: true
  minAvailable: 1
```

---

# 5. Environment-specific values

Common configuration stays in `values.yaml`.

Environment differences should be stored separately:

```text
values-production.yaml
values-staging.yaml
values-development.yaml
```

Example production override:

```yaml
global:
  environment: production
  cluster: prod-eks-01

sns:
  topicArn: >
    arn:aws:sns:eu-west-2:123456789012:
    production-monitoring-servicenow-alerts

snsPublisher:
  replicaCount: 3

alerts:
  defaultLabels:
    environment: production
    notification_target: servicenow

serviceNow:
  enabled: true
  autoResolve: true
```

Example development override:

```yaml
global:
  environment: development
  cluster: dev-eks-01

sns:
  topicArn: >
    arn:aws:sns:eu-west-2:123456789012:
    development-monitoring-alerts

snsPublisher:
  replicaCount: 1

alerts:
  defaultLabels:
    environment: development
    notification_target: team-channel

serviceNow:
  enabled: false
  autoResolve: false
```

This prevents a development deployment from accidentally creating production ServiceNow tickets.

---

# 6. SNS publisher Deployment template

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "servicenow-alerting.fullname" . }}-sns-publisher
  labels:
    {{- include "servicenow-alerting.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.snsPublisher.replicaCount }}

  selector:
    matchLabels:
      {{- include "servicenow-alerting.selectorLabels" . | nindent 6 }}
      app.kubernetes.io/component: sns-publisher

  template:
    metadata:
      labels:
        {{- include "servicenow-alerting.selectorLabels" . | nindent 8 }}
        app.kubernetes.io/component: sns-publisher

    spec:
      serviceAccountName: {{ include "servicenow-alerting.serviceAccountName" . }}

      securityContext:
        {{- toYaml .Values.security.podSecurityContext | nindent 8 }}

      containers:
        - name: sns-publisher

          image: >
            {{ .Values.snsPublisher.image.repository }}:
            {{ .Values.snsPublisher.image.tag }}

          imagePullPolicy: {{ .Values.snsPublisher.image.pullPolicy }}

          securityContext:
            {{- toYaml .Values.security.containerSecurityContext | nindent 12 }}

          ports:
            - name: http
              containerPort: {{ .Values.snsPublisher.service.port }}

          env:
            - name: AWS_REGION
              value: {{ .Values.global.awsRegion | quote }}

            - name: SNS_TOPIC_ARN
              value: {{ .Values.sns.topicArn | quote }}

            - name: MESSAGE_SCHEMA_VERSION
              value: {{ .Values.sns.messageSchemaVersion | quote }}

            - name: ENVIRONMENT
              value: {{ .Values.global.environment | quote }}

            - name: CLUSTER
              value: {{ .Values.global.cluster | quote }}

            - name: DEFAULT_ASSIGNMENT_GROUP
              value: {{ .Values.serviceNow.assignmentGroup | quote }}

          livenessProbe:
            httpGet:
              path: {{ .Values.snsPublisher.probes.liveness.path }}
              port: http

            initialDelaySeconds: >
              {{ .Values.snsPublisher.probes.liveness.initialDelaySeconds }}

            periodSeconds: >
              {{ .Values.snsPublisher.probes.liveness.periodSeconds }}

          readinessProbe:
            httpGet:
              path: {{ .Values.snsPublisher.probes.readiness.path }}
              port: http

            initialDelaySeconds: >
              {{ .Values.snsPublisher.probes.readiness.initialDelaySeconds }}

            periodSeconds: >
              {{ .Values.snsPublisher.probes.readiness.periodSeconds }}

          resources:
            {{- toYaml .Values.snsPublisher.resources | nindent 12 }}
```

---

# 7. SNS publisher Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ include "servicenow-alerting.fullname" . }}-sns-publisher
  labels:
    {{- include "servicenow-alerting.labels" . | nindent 4 }}
    app.kubernetes.io/component: sns-publisher
spec:
  type: ClusterIP

  selector:
    {{- include "servicenow-alerting.selectorLabels" . | nindent 4 }}
    app.kubernetes.io/component: sns-publisher

  ports:
    - name: http
      port: {{ .Values.snsPublisher.service.port }}
      targetPort: http
```

This Service remains internal to the cluster. Alertmanager invokes it using Kubernetes DNS:

```text
http://servicenow-alerting-sns-publisher.monitoring.svc.cluster.local:8080/alerts
```

---

# 8. Alertmanager configuration through Helm

Where the Prometheus Operator supports `AlertmanagerConfig`, the chart can create:

```yaml
apiVersion: monitoring.coreos.com/v1alpha1
kind: AlertmanagerConfig
metadata:
  name: {{ include "servicenow-alerting.fullname" . }}
  labels:
    {{- include "servicenow-alerting.labels" . | nindent 4 }}
spec:
  route:
    receiver: sns-publisher

    groupBy:
      {{- toYaml .Values.alertmanager.route.groupBy | nindent 6 }}

    groupWait: {{ .Values.alertmanager.route.groupWait }}
    groupInterval: {{ .Values.alertmanager.route.groupInterval }}
    repeatInterval: {{ .Values.alertmanager.route.repeatInterval }}

    matchers:
      - name: severity
        value: critical
        matchType: "="

      - name: environment
        value: {{ .Values.global.environment | quote }}
        matchType: "="

      - name: notification_target
        value: servicenow
        matchType: "="

  receivers:
    - name: sns-publisher

      webhookConfigs:
        - url: >
            http://{{ include "servicenow-alerting.fullname" . }}-sns-publisher:
            {{ .Values.snsPublisher.service.port }}/alerts

          sendResolved: {{ .Values.alertmanager.sendResolved }}
```

The exact `AlertmanagerConfig` API version and field names must match the Prometheus Operator version deployed in the cluster.

---

# 9. Prometheus rule templating

The alert threshold and duration should be driven by values:

```yaml
{{- if and .Values.alerts.enabled
          .Values.alerts.rules.paymentApiHighErrorRate.enabled }}

apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: {{ include "servicenow-alerting.fullname" . }}-application-alerts
  labels:
    {{- include "servicenow-alerting.labels" . | nindent 4 }}
spec:
  groups:
    - name: payment-api.rules

      rules:
        - alert: PaymentApiHighErrorRate

          expr: |
            (
              sum by (
                application,
                service,
                environment,
                cluster,
                namespace
              ) (
                rate(
                  http_server_requests_seconds_count{
                    application="{{ .Values.global.application }}",
                    service="{{ .Values.global.service }}",
                    status=~"5.."
                  }[
                    {{- .Values.alerts.rules.paymentApiHighErrorRate.evaluationWindow -}}
                  ]
                )
              )
              /
              sum by (
                application,
                service,
                environment,
                cluster,
                namespace
              ) (
                rate(
                  http_server_requests_seconds_count{
                    application="{{ .Values.global.application }}",
                    service="{{ .Values.global.service }}"
                  }[
                    {{- .Values.alerts.rules.paymentApiHighErrorRate.evaluationWindow -}}
                  ]
                )
              )
            )
            >
            {{ .Values.alerts.rules.paymentApiHighErrorRate.threshold }}

          for: >
            {{ .Values.alerts.rules.paymentApiHighErrorRate.pendingDuration }}

          labels:
            severity: >
              {{ .Values.alerts.rules.paymentApiHighErrorRate.severity }}

            service: {{ .Values.global.service | quote }}
            application: {{ .Values.global.application | quote }}
            environment: {{ .Values.global.environment | quote }}
            cluster: {{ .Values.global.cluster | quote }}
            team: {{ .Values.global.team | quote }}
            notification_target: servicenow

          annotations:
            summary: >
              {{ .Values.global.service }} error rate is above
              {{ mulf
                   .Values.alerts.rules.paymentApiHighErrorRate.threshold
                   100
              }}%

            description: >
              The {{ .Values.global.service }} HTTP 5xx error rate
              has exceeded the configured threshold.

{{- end }}
```

In practice, keep complex PromQL readable. Avoid over-templating every part of an expression because this can make rules difficult to review and debug.

---

# 10. Application ServiceMonitor

```yaml
{{- if .Values.applicationMetrics.enabled }}

apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: {{ include "servicenow-alerting.fullname" . }}-application
  labels:
    release: {{ .Values.prometheus.releaseLabel }}
spec:
  namespaceSelector:
    matchNames:
      - {{ .Values.applicationMetrics.namespace }}

  selector:
    matchLabels:
      {{- toYaml .Values.applicationMetrics.selector | nindent 6 }}

  endpoints:
    - port: {{ .Values.applicationMetrics.endpoint.port }}
      path: {{ .Values.applicationMetrics.endpoint.path }}
      interval: {{ .Values.applicationMetrics.endpoint.interval }}

{{- end }}
```

The application chart must create a Service exposing the management port with a matching label.

For example:

```yaml
metadata:
  labels:
    app: payment-api
```

---

# 11. ServiceAccount and AWS permissions

The Kubernetes ServiceAccount is packaged by Helm:

```yaml
{{- if .Values.serviceAccount.create }}

apiVersion: v1
kind: ServiceAccount
metadata:
  name: {{ include "servicenow-alerting.serviceAccountName" . }}

  annotations:
    {{- toYaml .Values.serviceAccount.annotations | nindent 4 }}

  labels:
    {{- include "servicenow-alerting.labels" . | nindent 4 }}

{{- end }}
```

The referenced AWS IAM role should be created outside Helm.

The relationship becomes:

```text
Kubernetes ServiceAccount
          │
          │ annotation or Pod Identity association
          ▼
AWS IAM role
          │
          ▼
sns:Publish on one topic
```

Do not place AWS access keys in `values.yaml`.

---

# 12. Secrets

The SNS publisher itself may not require a secret when it uses IAM workload identity.

The ServiceNow consumer may require:

```text
ServiceNow instance URL
OAuth client ID
OAuth client secret
OAuth token endpoint
```

These should not be stored directly in normal Helm values.

A preferred pattern is:

```text
AWS Secrets Manager
        │
        ▼
External Secrets Operator
        │
        ▼
Kubernetes Secret
        │
        ▼
ServiceNow integration Pod
```

Example Helm template:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: {{ include "servicenow-alerting.fullname" . }}-servicenow
spec:
  refreshInterval: 1h

  secretStoreRef:
    name: aws-secrets-manager
    kind: ClusterSecretStore

  target:
    name: {{ include "servicenow-alerting.fullname" . }}-servicenow

  data:
    - secretKey: client-id
      remoteRef:
        key: /monitoring/servicenow
        property: clientId

    - secretKey: client-secret
      remoteRef:
        key: /monitoring/servicenow
        property: clientSecret

    - secretKey: instance-url
      remoteRef:
        key: /monitoring/servicenow
        property: instanceUrl
```

---

# 13. Helm release commands

Install:

```bash
helm upgrade \
  --install \
  servicenow-alerting \
  ./servicenow-alerting \
  --namespace monitoring \
  --create-namespace \
  --values values.yaml \
  --values values-production.yaml
```

Preview generated resources:

```bash
helm template \
  servicenow-alerting \
  ./servicenow-alerting \
  --namespace monitoring \
  --values values.yaml \
  --values values-production.yaml
```

Validate the chart:

```bash
helm lint ./servicenow-alerting
```

Inspect the installed release:

```bash
helm status servicenow-alerting \
  --namespace monitoring
```

View deployed values:

```bash
helm get values servicenow-alerting \
  --namespace monitoring \
  --all
```

Rollback:

```bash
helm rollback servicenow-alerting 1 \
  --namespace monitoring
```

---

# 14. CI/CD requirements

The Helm chart pipeline should perform:

```text
1. helm dependency update
2. helm lint
3. helm template
4. YAML schema validation
5. Kubernetes API validation
6. Prometheus rule validation
7. Alertmanager configuration validation
8. Security policy checks
9. Helm package creation
10. Publish chart to OCI registry
11. Deploy to test cluster
12. Run end-to-end alert test
13. Promote the same chart version to production
```

Example chart packaging:

```bash
helm package ./servicenow-alerting
```

Publish to an OCI registry:

```bash
helm push \
  servicenow-alerting-1.0.0.tgz \
  oci://123456789012.dkr.ecr.eu-west-2.amazonaws.com/helm
```

Production deployment should use an immutable chart version:

```bash
helm upgrade \
  --install \
  servicenow-alerting \
  oci://123456789012.dkr.ecr.eu-west-2.amazonaws.com/helm/servicenow-alerting \
  --version 1.0.0 \
  --namespace monitoring \
  --values values-production.yaml
```

Avoid deploying directly from a mutable local chart directory in production.

---

# 15. Helm acceptance criteria

The Helm portion should satisfy these additional acceptance criteria:

* `helm lint` passes.
* `helm template` produces valid Kubernetes manifests.
* The chart supports production and non-production values.
* SNS topic ARNs are configurable without changing templates.
* Alert thresholds and durations are configurable.
* The ServiceNow route can be enabled or disabled.
* No credentials appear in rendered Helm manifests unless represented as Secret references.
* The SNS publisher uses a dedicated ServiceAccount.
* Reinstalling or upgrading the release is idempotent.
* A failed deployment can be rolled back.
* PrometheusRule resources are selected by the deployed Prometheus instance.
* ServiceMonitor resources are selected by the deployed Prometheus instance.
* AlertmanagerConfig resources are selected by the deployed Alertmanager instance.
* A chart upgrade does not unexpectedly delete active monitoring rules.
* The chart version and container image version are independently visible.
* The deployed resources contain standard ownership and release labels.

---

# 16. Final packaged solution

The complete system would now be specified as:

```text
Infrastructure deployment
│
└── Terraform / CloudFormation
    ├── SNS
    ├── SQS
    ├── DLQ
    ├── KMS
    ├── IAM
    └── Secrets Manager

Kubernetes deployment
│
└── Helm chart
    ├── YACE
    ├── YACE ServiceMonitor
    ├── application ServiceMonitor
    ├── Prometheus alert rules
    ├── Alertmanager ServiceNow route
    ├── SNS publisher
    ├── ServiceAccount
    ├── NetworkPolicy
    ├── PodDisruptionBudget
    └── integration monitoring

Runtime flow
│
└── Application / CloudWatch
        ↓
      Prometheus
        ↓
      Alertmanager
        ↓
      SNS publisher
        ↓
      SNS
        ↓
      SQS
        ↓
      ServiceNow consumer
        ↓
      ServiceNow incident
```

The Helm chart becomes the **versioned, repeatable Kubernetes delivery unit**, while Terraform or CloudFormation remains responsible for the AWS infrastructure lifecycle.
