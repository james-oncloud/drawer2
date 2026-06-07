# How Grafana Works (in this project)

Grafana is a **visualisation layer**. It does not collect or store metrics itself. In this stack it reads time-series data from **Prometheus** using **PromQL** queries, then renders dashboards.

```text
Java App (/metrics)  →  Prometheus (store + query)  →  Grafana (charts)
```

---

## End-to-end flow in this repo

1. **Java app** (`App.java`) registers meters with Micrometer and exposes them at `http://app:8080/metrics`.
2. **Prometheus** (`prometheus/prometheus.yml`) scrapes that endpoint every **5 seconds** and stores samples in its internal time-series database.
3. **Grafana** connects to Prometheus at `http://prometheus:9090`, runs PromQL when a dashboard refreshes, and draws panels.

Grafana never talks to the Java app directly.

---

## How Grafana consumes metrics

### Datasource

Configured in `grafana/provisioning/datasources/prometheus.yml`:

- **Type**: `prometheus`
- **URL**: `http://prometheus:9090` (Docker network hostname)
- **Access**: `proxy` — the browser talks to Grafana; Grafana talks to Prometheus server-side

Each dashboard panel references this datasource (uid: `prometheus`).

### Queries

Panels don't embed raw metric files. They send **PromQL** to Prometheus, e.g.:

```promql
rate(app_requests_total[1m])
```

Prometheus returns time-series points; Grafana maps them to graphs, stats, gauges, etc.

Common patterns in `java-app-metrics.json`:

| Panel            | PromQL idea                                      |
|------------------|--------------------------------------------------|
| Request rate     | `rate(app_requests_total[1m])`                   |
| Error rate       | `rate(app_errors_total[1m])`                     |
| Latency p95      | `histogram_quantile(0.95, sum(rate(..._bucket[1m])) by (le))` |
| Active tasks     | `app_active_tasks` (instant gauge value)         |

### Refresh

The dashboard refresh (e.g. every **5s**) triggers new PromQL queries. Grafana does not poll `/metrics` on the Java app.

---

## Metrics format (what the Java app exposes)

Prometheus expects **text exposition format** at `/metrics`:

```text
# HELP app_requests_total Total processed requests
# TYPE app_requests_total counter
app_requests_total{endpoint="work"} 281.0

# HELP app_active_tasks Currently running tasks
# TYPE app_active_tasks gauge
app_active_tasks 0.0

# HELP app_request_duration_seconds Request processing duration
# TYPE app_request_duration_seconds summary
app_request_duration_seconds_count 316
app_request_duration_seconds_sum 48.62
```

Micrometer (`PrometheusMeterRegistry`) generates this when Prometheus scrapes.

### Metric types

| Prometheus type | Micrometer in this app | Meaning |
|-----------------|------------------------|---------|
| **counter**     | `Counter`              | Only goes up (requests, errors) |
| **gauge**       | `Gauge`                | Current value (`app_active_tasks`) |
| **histogram** / **summary** | `Timer`      | Latency distribution (`_count`, `_sum`, `_bucket`) |

### Labels (tags)

Micrometer tags become Prometheus **labels**:

```text
app_requests_total{endpoint="work"} 281.0
```

PromQL can filter or group: `sum by (endpoint) (rate(app_requests_total[1m]))`.

---

## Dashboard provisioning in this repo

### Dashboard files

JSON dashboards live in `grafana/dashboards/` (e.g. `java-app-metrics.json`).

Loader: `grafana/provisioning/dashboards/dashboards.yml` — mounts that folder into Grafana at startup.

### What's in a dashboard JSON

- **Panels**: chart type, position, PromQL in `targets[].expr`
- **Datasource uid**: `"uid": "prometheus"` (must match datasource config)
- **Units / thresholds**: e.g. reqps, red below 0.90 for SLO stats

UI edits are **ephemeral** unless exported back to JSON and committed.

---

## Grafana vs Prometheus roles

| | Prometheus | Grafana |
|---|------------|---------|
| Collects metrics | Yes (scrapes `/metrics`) | No |
| Stores history | Yes | No (only query results / config) |
| Query language | PromQL | Uses PromQL via datasource |
| Dashboards | Basic graph UI | Rich dashboards, alerts, variables |
| Alerts (here) | Could use `alerts.yml` | Can alert on PromQL too |

---

## Useful URLs (local)

| URL | Purpose |
|-----|---------|
| http://localhost:8080/metrics | Raw metrics from Java |
| http://localhost:9090/targets | Scrape health (`java-app` UP?) |
| http://localhost:9090/graph | PromQL in Prometheus UI |
| http://localhost:3000 | Grafana (`admin` / `admin`) |

---

## Mental model

1. **Instrument** code → counters/timers/gauges in Micrometer.
2. **Expose** → Prometheus text at `/metrics`.
3. **Scrape & store** → Prometheus every 5s.
4. **Query & visualise** → Grafana PromQL on refresh.

Grafana is the **display**; Prometheus is the **database**; the Java app is the **source**.
