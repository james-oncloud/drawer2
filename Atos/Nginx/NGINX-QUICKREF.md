# Nginx config — quick reference

How this project's Nginx edge works. Skim the tables; jump to the file you need.

```
Client  →  Nginx :8080  →  Spring Boot app:8080
              │
              ├─ access.json.log   (telemetry)
              ├─ access.log        (human)
              └─ X-Request-ID  →  app MDC
```

---

## Files

| File | Role |
|------|------|
| `nginx/nginx.conf` | Global: workers, JSON logs, upstream pool |
| `nginx/conf.d/orders.conf` | Server + `location` routing + `$req_id` map |
| `nginx/proxy_params.conf` | Shared proxy headers, timeouts, request-id |

Load order: `nginx.conf` → `include conf.d/*.conf` → each location `include proxy_params.conf`.

---

## Request path (what happens)

1. Client hits `http://localhost:8080/...`
2. `map` sets `$req_id` = inbound `X-Request-ID`, or Nginx `$request_id` if missing
3. Matching `location` runs → `proxy_pass http://orders_api`
4. `proxy_params.conf` adds forwarded headers + `X-Request-ID: $req_id`
5. Spring Boot handles the call; Nginx logs one JSON line

---

## Routing cheat sheet

| URI | Where it goes |
|-----|----------------|
| `/` | Nginx only — static JSON hint |
| `/api/...` | → `orders_api` (Spring) |
| `/actuator/...` | → `orders_api` (Spring) |
| `/api/orders/health-demo/boom` | → Spring (demo 500) |
| `/nginx_status` | Nginx `stub_status` (internal IPs only) |

Exact `location =` beats prefix `location /api/`.

---

## Upstream (`nginx.conf`)

```nginx
upstream orders_api {
    least_conn;
    server app:8080 max_fails=3 fail_timeout=30s;
    keepalive 32;
}
```

| Knob | Meaning |
|------|---------|
| `least_conn` | Prefer least-busy backend |
| `app:8080` | Docker Compose service name |
| `max_fails` / `fail_timeout` | Mark peer down after failures |
| `keepalive 32` | Reuse connections to app |

Add more `server` lines to scale out.

---

## Proxy headers (`proxy_params.conf`)

| Header | Purpose |
|--------|---------|
| `Host` | Original host |
| `X-Real-IP` | Client IP |
| `X-Forwarded-For` | Proxy chain |
| `X-Forwarded-Proto` | `http` / `https` |
| `X-Request-ID` | Correlation (log + app) |

Also: `proxy_http_version 1.1` + empty `Connection` (needed for upstream keepalive).

Timeouts: connect `5s`, send/read `60s`.

---

## Request ID

```nginx
map $http_x_request_id $req_id {
    default   $http_x_request_id;
    ""        $request_id;
}
```

- Client sends `X-Request-ID` → reused  
- Otherwise → Nginx generates `$request_id`  
- Same value in: response header, JSON log `request_id`, Spring `requestId=` logs

---

## Telemetry fields (JSON log)

Log file: `logs/nginx/access.json.log`

| Field | Use it for |
|-------|------------|
| `request_id` | Join with app logs |
| `request_time` | End-to-end latency (s) |
| `upstream_response_time` | App-only latency |
| `upstream_connect_time` | TCP to app |
| `upstream_header_time` | Time to first byte from app |
| `status` | Edge HTTP status |
| `upstream_status` | App HTTP status |
| `upstream_addr` | Which backend answered |
| `uri` / `method` | What was called |

**Rule of thumb:** high `request_time` but low `upstream_response_time` → edge/network; both high → app.

Also: `logs/nginx/access.log` (plain text) and `error.log`.

```bash
tail -f logs/nginx/access.json.log | jq
docker compose logs -f app   # match requestId=
```

---

## Common edits

| Goal | Change |
|------|--------|
| New API path | Add `location` in `orders.conf` + `proxy_pass` + `include proxy_params.conf` |
| More backends | Extra `server host:port;` in `upstream orders_api` |
| Stricter health | Lock down `/actuator/` (IP allow / auth) |
| TLS | `listen 443 ssl;` + certs; keep app internal-only |
| Longer reads | Raise `proxy_read_timeout` in `proxy_params.conf` |
| Bigger uploads | Raise `client_max_body_size` in `orders.conf` |

Reload after edits (Compose rebuild or):

```bash
docker compose exec nginx nginx -t && docker compose exec nginx nginx -s reload
```

---

## Quick ops

```bash
docker compose up --build          # start
curl -s http://localhost:8080/actuator/health
curl -s -X POST http://localhost:8080/api/orders \
  -H 'Content-Type: application/json' \
  -H 'X-Request-ID: demo-1' \
  -d '{"sku":"WIDGET","quantity":2}'
tail -f logs/nginx/access.json.log | jq
```

Postman: `postman/Orders-API.postman_collection.json`
