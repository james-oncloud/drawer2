# Sample Spring Boot + Prometheus (Docker)

Minimal Java + Spring Boot app that exposes Prometheus metrics, scraped by Prometheus. Both run via Docker Compose.

## Quick start

```bash
cd sample_app
docker compose up --build
```

- App: http://localhost:8080/hello  
- Metrics: http://localhost:8080/actuator/prometheus  
- Prometheus UI: http://localhost:9090  

Generate traffic:

```bash
curl http://localhost:8080/hello
curl http://localhost:8080/hello?name=DevOps
```

In Prometheus, try queries such as:

- `sample_app_hello_total`
- `http_server_requests_seconds_count`
- `up{job="sample-app"}`

## Layout

| Path | Role |
|---|---|
| `src/...` | Spring Boot app (`/hello`, Actuator, Micrometer) |
| `Dockerfile` | Multi-stage Maven build + JRE image |
| `prometheus/prometheus.yml` | Scrapes `sample-app:8080/actuator/prometheus` |
| `docker-compose.yml` | Runs app + Prometheus |

## Stop

```bash
docker compose down
```
