# Nginx + Spring Boot: reverse proxy & telemetry demo

A typical edge setup: **Nginx** terminates HTTP and reverse-proxies to a **Spring Boot 4.1** (Java 21) orders API. Nginx is the best place to capture *edge* telemetry—latency, status codes, upstream timing—while the app logs business events keyed by the same request ID.

```
Client ──► Nginx (:8080) ──► Spring Boot orders-api (:8080 inside Docker)
              │                      │
              ├─ access.json.log     ├─ app logs with requestId=…
              ├─ access.log          └─ Actuator /actuator/health
              └─ X-Request-ID ──────────────────────────┘
```

## What Nginx gives you for telemetry

| Signal | Nginx variable / feature | Why it matters |
| --- | --- | --- |
| End-to-end latency | `$request_time` | Client-visible time (includes queue + upstream) |
| App latency | `$upstream_response_time` | Pure backend time — isolate edge vs app slowness |
| Connect / TTFB | `$upstream_connect_time`, `$upstream_header_time` | Diagnose network vs app work |
| Status | `$status`, `$upstream_status` | Edge vs upstream error rates |
| Correlation | `$req_id` → `X-Request-ID` | Join Nginx JSON logs with Spring MDC logs |
| Client IP | `$remote_addr`, `X-Forwarded-For` | Accurate audit / geo after proxying |
| Process health | `stub_status` at `/nginx_status` | Active connections, request counters |

All of that is emitted as **one JSON line per request** in `logs/nginx/access.json.log`, ready for Filebeat, Fluent Bit, Vector, Datadog Agent, etc.

## Layout

```
.
├── docker-compose.yml
├── app/                    # Spring Boot 4.1 orders API
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/...
└── nginx/
    ├── Dockerfile
    ├── nginx.conf          # JSON log_format, upstream pool
    ├── proxy_params.conf   # X-Request-ID + forwarded headers
    └── conf.d/orders.conf  # server / locations
```

## Run it

```bash
docker compose up --build
```

## Shutdown

```bash
docker compose down --rmi local
```

API is on **http://localhost:8080**.

### Generate traffic

```bash
# Create an order
curl -s -X POST http://localhost:8080/api/orders \
  -H 'Content-Type: application/json' \
  -d '{"sku":"WIDGET","quantity":2}' | jq

# Read it back (use the returned id)
curl -s http://localhost:8080/api/orders/1001 | jq

# Slow path: ids divisible by 7 sleep ~450ms so upstream_response_time spikes
curl -s -X POST http://localhost:8080/api/orders \
  -H 'Content-Type: application/json' \
  -d '{"sku":"SLOW","quantity":1}' >/dev/null
# then GET an id ending in 7 after creating enough orders, or:
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8080/api/orders/1001

# 5xx for alert pipelines
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8080/api/orders/health-demo/boom

# Pass your own correlation id (also works without — Nginx generates one)
curl -s http://localhost:8080/api/orders/1001 -H 'X-Request-ID: demo-trace-001' -D -
```

### Inspect telemetry

```bash
# Structured edge telemetry
tail -f logs/nginx/access.json.log | jq

# App logs (same request_id)
docker compose logs -f app
```

Example Nginx JSON line:

```json
{
  "time": "2026-07-30T21:00:00+00:00",
  "request_id": "a1b2c3d4e5f6789012345678abcdef01",
  "method": "GET",
  "uri": "/api/orders/1001",
  "status": 200,
  "request_time": 0.012,
  "upstream_status": "200",
  "upstream_response_time": "0.008",
  "upstream_addr": "172.18.0.2:8080"
}
```

Match that `request_id` in the Spring log line:

```text
2026-07-30T21:00:00.012Z ... INFO ... OrderController requestId=a1b2c3d4... - Fetching order id=1001
```

## How the correlation works

1. Nginx `map` sets `$req_id` from inbound `X-Request-ID`, or from Nginx’s built-in `$request_id`.
2. `proxy_params.conf` forwards `X-Request-ID: $req_id` to Spring Boot and echoes it on the response.
3. `RequestIdFilter` stores that header in SLF4J **MDC** so every app log line carries `requestId=…`.
4. JSON access logs include `"request_id":"$req_id"` — same key, two systems, one trace.

## Production notes

- Terminate TLS on Nginx (`listen 443 ssl`) and keep the app on an internal network only.
- Restrict `/actuator/` and `/nginx_status` (IP allowlists or auth).
- Ship `access.json.log` with a collector; alert on `status >= 500` or `request_time > SLO`.
- For metrics scrapes, prefer OpenTelemetry / Prometheus exporters; Nginx Plus or `nginx-prometheus-exporter` can scrape `stub_status`.
- Scale the `upstream orders_api` block with more `server` lines or a service discovery integration.
