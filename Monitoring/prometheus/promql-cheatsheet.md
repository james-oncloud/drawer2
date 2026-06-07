# PromQL Cheatsheet

Quick reference for [Prometheus Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/). Examples use metrics from this project's Java app where possible.

Run queries at http://localhost:9090/graph or in Grafana panel editors.

---

## Selectors

```promql
# Metric name only
app_requests_total

# Filter by label (exact match)
app_requests_total{endpoint="work"}

# Regex match (=~ / !~)
app_requests_total{endpoint=~"work|slow"}

# Exclude label value
app_requests_total{endpoint!="slow"}

# Multiple labels
app_requests_total{endpoint="work", job="java-app"}
```

---

## Instant vs range vectors

| Query type | When | Example |
|------------|------|---------|
| **Instant vector** | Single value per series, *now* | `app_active_tasks` |
| **Range vector** | Samples over a time window | `app_requests_total[5m]` |

Range vectors are used inside functions like `rate()` — not valid alone in a graph (needs a function).

```promql
# Instant: current active tasks
app_active_tasks

# Range: raw counter samples over last 5 minutes (input to rate)
app_requests_total[5m]
```

---

## Core functions

### `rate()` — per-second average increase (counters)

Use for counters (`app_requests_total`, `app_errors_total`).

```promql
rate(app_requests_total[1m])
rate(app_errors_total[5m])
```

Pick a range **≥ 4× scrape interval** (this project scrapes every 5s → `[1m]` or `[5m]` is fine).

### `irate()` — instant rate (last two samples)

More spiky; good for fast-moving counters, less smooth than `rate()`.

```promql
irate(app_requests_total[5m])
```

### `increase()` — total increase over range

```promql
increase(app_requests_total[1h])
```

### `delta()` — difference for gauges

```promql
delta(app_active_tasks[5m])
```

---

## Aggregation

```promql
# Sum all series into one
sum(rate(app_requests_total[1m]))

# Sum grouped by label
sum by (endpoint) (rate(app_requests_total[1m]))

# Average, min, max, count
avg(app_active_tasks)
max(app_active_tasks)
count(app_requests_total)

# Top 5 endpoints by request rate
topk(5, sum by (endpoint) (rate(app_requests_total[5m])))
```

Common aggregators: `sum`, `avg`, `min`, `max`, `count`, `stddev`, `stdvar`, `topk`, `bottomk`.

---

## Histograms and quantiles

Micrometer `Timer` metrics export as histogram/summary series. Use `_bucket`, `_count`, `_sum`.

```promql
# p50 latency
histogram_quantile(0.50,
  sum(rate(app_request_duration_seconds_bucket[1m])) by (le)
)

# p95 latency
histogram_quantile(0.95,
  sum(rate(app_request_duration_seconds_bucket[1m])) by (le)
)

# p99 by endpoint (after Exercise 1 adds endpoint tag)
histogram_quantile(0.99,
  sum(rate(app_request_duration_seconds_bucket[1m])) by (le, endpoint)
)

# Average latency from sum/count
rate(app_request_duration_seconds_sum[1m])
/
rate(app_request_duration_seconds_count[1m])
```

**Rule:** always `sum ... by (le)` (and other grouping labels) inside `histogram_quantile`.

---

## Arithmetic and comparisons

```promql
# Error ratio (0.0–1.0)
rate(app_errors_total[5m])
/
(rate(app_requests_total[5m]) + rate(app_errors_total[5m]))

# Success ratio
sum(rate(app_requests_total[5m]))
/
(sum(rate(app_requests_total[5m])) + sum(rate(app_errors_total[5m])))

# Requests per minute
rate(app_requests_total[1m]) * 60

# Compare two series
rate(app_errors_total[5m]) > 0.1
```

Operators: `+`, `-`, `*`, `/`, `%`, `==`, `!=`, `<`, `>`, `<=`, `>=`, `and`, `or`, `unless`.

---

## Time and offsets

```promql
# Value 1 hour ago
app_requests_total offset 1h

# Compare current rate vs 1 hour ago
rate(app_requests_total[5m])
/
rate(app_requests_total[5m] offset 1h)

# @ modifier (fixed evaluation time, Prometheus 2.x+)
rate(app_requests_total[5m]) @ 1609746000
```

---

## Useful patterns for this project

| Goal | PromQL |
|------|--------|
| Request rate | `rate(app_requests_total[1m])` |
| Error rate | `rate(app_errors_total[1m])` |
| Active tasks (now) | `app_active_tasks` |
| p95 latency | `histogram_quantile(0.95, sum(rate(app_request_duration_seconds_bucket[1m])) by (le))` |
| Errors in last hour | `increase(app_errors_total[1h])` |
| Is app being scraped? | `up{job="java-app"}` |
| Scrape duration | `scrape_duration_seconds{job="java-app"}` |

---

## `up` and meta-metrics

Prometheus adds metrics about scraping:

```promql
# 1 = target healthy, 0 = down
up{job="java-app"}

# Samples scraped last time
scrape_samples_scraped{job="java-app"}

# Time since last successful scrape
time() - scrape_timestamp{job="java-app"}
```

---

## Grafana tips

```promql
# Range query (time series panel) — default
rate(app_requests_total[1m])

# Instant query (stat/gauge panel) — set in Grafana query options
app_active_tasks
```

- **Legend:** `{{endpoint}}`, `{{job}}`, `{{status}}`
- **Min step:** match scrape interval (~5s here) for smooth graphs
- **[$__rate_interval]:** Grafana macro for a sensible range window

---

## Common mistakes

| Mistake | Fix |
|---------|-----|
| `rate()` on a gauge | Use `rate()` on counters only; use `delta()` or raw value for gauges |
| Range too short (`[5s]` with 5s scrape) | Use at least `[1m]` |
| `histogram_quantile` without `by (le)` | Always aggregate buckets with `sum by (le)` |
| Graphing raw counters | Counters always increase — use `rate()` or `increase()` |
| Expecting Grafana to read `/metrics` | Query Prometheus, not the Java app |

---

## Quick syntax reference

```promql
<aggregation> [by|without (<labels>)] (<expression>)
<function>(<expression> [<range>]) [offset <duration>]
<expression> <operator> <expression>
<metric>{label="value"}[<range>]
```

**Duration units:** `ms`, `s`, `m`, `h`, `d`, `w`, `y` — e.g. `[5m]`, `[1h]`, `offset 1d`

---

## Further reading

- [Prometheus querying basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [PromQL functions](https://prometheus.io/docs/prometheus/latest/querying/functions/)
- [Histograms and summaries](https://prometheus.io/docs/practices/histograms/)
- Project dashboards: `grafana/dashboards/java-app-metrics.json`
