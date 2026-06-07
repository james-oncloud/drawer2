# Monitoring Exercises

Three hands-on exercises to extend the Java app, expose new Prometheus metrics, and build a **new** Grafana dashboard. Work in the `Monitoring/` directory.

After each exercise, rebuild and verify:

```bash
docker compose up --build -d app
curl http://localhost:8080/metrics | grep app_
```

Existing dashboard: **Dashboards → Monitoring → Java App Metrics**  
Your new dashboards should live in `grafana/dashboards/` and appear automatically on Grafana restart (via provisioning).

---

## Exercise 1 — Add a `/slow` endpoint and compare latency by endpoint

### Goal

Add a second workload with different behaviour, tag metrics by endpoint, and chart both on a new dashboard.

### Tasks

1. **Java (`App.java`)**
   - Add a `GET /slow` handler that simulates work with **500–1500 ms** latency and a **~5%** error rate.
   - Refactor counters and timers so each endpoint is distinguishable in Prometheus, e.g.:
     - `app_requests_total{endpoint="work"}` (existing)
     - `app_requests_total{endpoint="slow"}` (new)
     - Same pattern for errors and duration (`app_request_duration_seconds` with an `endpoint` tag).
   - Register a background job for `/slow` (e.g. every 10 seconds) so the dashboard populates without manual calls.
   - Log the new endpoint on startup alongside `/work` and `/health`.

2. **Grafana dashboard**
   - Create `grafana/dashboards/endpoint-comparison.json`.
   - Title: **Endpoint Comparison**.
   - Include at least three panels:
     - Request rate **by endpoint** (`rate(app_requests_total[1m])` with legend per `endpoint`)
     - p95 latency **by endpoint**
     - Error rate **by endpoint**

### Hints

- Micrometer tags become Prometheus labels: `.tag("endpoint", "slow")`.
- PromQL example for p95 by label:
  ```promql
  histogram_quantile(0.95, sum(rate(app_request_duration_seconds_bucket[1m])) by (le, endpoint))
  ```
- Copy panel structure from `java-app-metrics.json`; change `uid` to something unique (e.g. `endpoint-comparison`).

### Done when

- `curl http://localhost:8080/slow` returns `done` or `error`.
- `/metrics` shows separate series per `endpoint` label.
- New dashboard loads under **Dashboards → Monitoring → Endpoint Comparison**.

---

## Exercise 2 — Categorise errors and add an SLO-style success ratio

### Goal

Replace the single error counter with typed failures, compute a success ratio in Grafana, and alert visually when quality drops.

### Tasks

1. **Java (`App.java`)**
   - Replace (or supplement) `app_errors_total` with counters tagged by `reason`, e.g.:
     - `simulated_failure` — random ~10% failure in `processWork`
     - `interrupted` — `InterruptedException` path
   - Keep `app_requests_total` for successes only, or add a separate `app_failures_total{reason="..."}` — be consistent and document your choice in a code comment.
   - Optionally add a **Gauge** `app_success_ratio` (0.0–1.0) updated after each request, or derive the ratio in PromQL only (preferred for production).

2. **Grafana dashboard**
   - Create `grafana/dashboards/reliability-slo.json`.
   - Title: **Reliability SLO**.
   - Include at least four panels:
     - **Stat**: success ratio over 5 minutes, e.g.  
       `sum(rate(app_requests_total[5m])) / (sum(rate(app_requests_total[5m])) + sum(rate(app_errors_total[5m])))`  
       (adjust if you renamed metrics)
     - **Time series**: error rate split by `reason` tag
     - **Bar gauge or pie chart**: total errors by `reason` over the dashboard time range
     - **Stat**: total successful requests (`increase(app_requests_total[1h])`)

3. **Threshold styling**
   - Colour the success-ratio stat **red** below 0.90, **yellow** below 0.95, **green** otherwise.

### Hints

- To break down by label in PromQL: `sum by (reason) (rate(app_errors_total[1m]))`.
- If you use separate failure counters, unify them in Grafana with:  
  `sum(rate(app_failures_total[5m])) by (reason)`.
- Grafana stat panel thresholds: **Panel → Field → Thresholds**.

### Done when

- `/metrics` exposes distinguishable error reasons.
- Triggering many requests (`curl` in a loop) shows a stable success ratio near ~90%.
- **Reliability SLO** dashboard renders all four panels with sensible values.

---

## Exercise 3 — Track HTTP traffic and build an API overview dashboard

### Goal

Instrument every HTTP request (path, method, status) and build a dashboard focused on the HTTP layer rather than business logic.

### Tasks

1. **Java (`App.java`)**
   - Add a Micrometer **`Counter`** `app_http_requests_total` with tags:
     - `method` — e.g. `GET`
     - `path` — e.g. `/work`, `/slow`, `/health`, `/metrics`
     - `status` — e.g. `200`, `500`, `405`
   - Increment it in each handler (including `/metrics` and failed method checks on `/work`).
   - Add a **`Timer`** `app_http_request_duration_seconds` with `method` and `path` tags; record duration for `/work`, `/slow`, and `/health` (skip or include `/metrics` — document your choice).
   - Do **not** remove existing business metrics; this exercise adds an HTTP layer on top.

2. **Grafana dashboard**
   - Create `grafana/dashboards/http-overview.json`.
   - Title: **HTTP Overview**.
   - Include at least four panels:
     - Request rate by **path** (`sum by (path) (rate(app_http_requests_total[1m]))`)
     - Request rate by **status** (stacked or separate series)
     - p99 latency by **path** for timed endpoints
     - **Table** panel: path, total requests, error count (status ≥ 400), and mean latency — use Prometheus instant queries or Grafana transformations

3. **Bonus (optional)**
   - Add a row panel grouping “Business metrics” vs “HTTP metrics”.
   - Link from **HTTP Overview** to **Java App Metrics** using a Grafana dashboard link.

### Hints

- Wrap handlers to avoid duplicating timing logic:
  ```java
  void handleTimed(String path, String method, Runnable handler) { ... }
  ```
- Paths must match exactly what you tag — `/metrics` scrapes will show up as traffic; that is expected.
- Table panel: use **Format as table** in query options, or **Transform → Organize fields**.

### Done when

- Hitting `curl -X POST http://localhost:8080/work` increments `app_http_requests_total{status="405", ...}`.
- **HTTP Overview** dashboard shows traffic to `/metrics` from Prometheus scrapes.
- p99 panel reflects that `/slow` (from Exercise 1) is slower than `/work` if both exist.

---

## General tips

| Step | Command |
|------|---------|
| Rebuild after Java changes | `docker compose up --build -d app` |
| Watch app logs | `docker compose logs -f app` |
| Verify Prometheus targets | http://localhost:9090/targets |
| Explore metrics in Prometheus | http://localhost:9090/graph |
| Edit dashboards in UI | changes are **not** persisted unless exported back to JSON |

To export a dashboard edited in the Grafana UI: **Share → Export → Save to file** → replace the JSON in `grafana/dashboards/`.

## Suggested order

1. **Exercise 1** — tags and PromQL by label  
2. **Exercise 2** — error dimensions and SLO thinking  
3. **Exercise 3** — HTTP instrumentation and table panels  

Exercises 2 and 3 build on concepts from earlier ones but can be attempted independently if you skip optional cross-references.
