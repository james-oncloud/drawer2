With the stack running (`docker compose up -d`), Prometheus is at **http://localhost:9090**.

## 1. Check scraping is working

Open **http://localhost:9090/targets**

You should see job **`java-app`** with state **UP**, scraping `app:8080/metrics` every 5 seconds (from `prometheus/prometheus.yml`).

If it’s **DOWN**, the app container may not be running:

```bash
docker compose ps
docker compose logs app
```

---

## 2. Query metrics in the UI

Open **http://localhost:9090/graph**

1. Pick a metric from the dropdown, or type a name, e.g.:
   - `app_requests_total`
   - `app_errors_total`
   - `app_active_tasks`
   - `app_request_duration_seconds_count`
2. Click **Execute**
3. Switch **Table** / **Graph** to view results

Example PromQL queries:

```promql
# Current active tasks
app_active_tasks

# Request rate (requests per second)
rate(app_requests_total[1m])

# Error rate
rate(app_errors_total[1m])

# p95 latency
histogram_quantile(0.95, sum(rate(app_request_duration_seconds_bucket[1m])) by (le))
```

Use the time range picker (top right) if you need more history.

---

## 3. Browse all metric names

In the Graph page, use the metric autocomplete, or open:

**http://localhost:9090/api/v1/label/__name__/values**

That lists every metric name Prometheus has stored.

---

## 4. Raw metrics from the Java app (before Prometheus)

Prometheus doesn’t read this directly from your browser — it **scrapes** the app. You can still inspect the source:

```bash
curl http://localhost:8080/metrics
```

That’s the text format Prometheus pulls every 5s.

---

## 5. HTTP API (optional)

```bash
# Instant query
curl -G 'http://localhost:9090/api/v1/query' \
  --data-urlencode 'query=app_active_tasks'

# Range query (last 15 minutes)
curl -G 'http://localhost:9090/api/v1/query_range' \
  --data-urlencode 'query=rate(app_requests_total[1m])' \
  --data-urlencode 'start='$(date -v-15M +%s) \
  --data-urlencode 'end='$(date +%s) \
  --data-urlencode 'step=15'
```

---

## Quick checklist

| Step | URL / command |
|------|----------------|
| Stack running | `docker compose ps` |
| Target healthy | http://localhost:9090/targets |
| Query & graph | http://localhost:9090/graph |
| Raw app metrics | `curl http://localhost:8080/metrics` |

More query examples: `Monitoring/prometheus/promql-cheatsheet.md`.