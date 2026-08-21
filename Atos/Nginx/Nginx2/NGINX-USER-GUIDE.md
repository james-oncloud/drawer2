# Nginx User Guide

A practical overview of what Nginx is, where it sits in an application architecture, how its main configuration files work, and how to run it.

---

## What is Nginx?

**Nginx** (pronounced “engine-x”) is a high-performance **web server**, **reverse proxy**, and **load balancer**. It sits at the edge of your stack and handles incoming HTTP/HTTPS traffic before it reaches your application servers.

It is commonly used to:

- Serve static files (HTML, CSS, JS, images)
- Terminate TLS (HTTPS)
- Reverse-proxy requests to backend apps (Spring Boot, Node, Python, etc.)
- Load-balance across multiple backend instances
- Act as an API gateway / edge layer (routing, headers, rate limits, caching)

---

## Role of Nginx

Think of Nginx as the **front door** of your system.

| Role | What it does |
|------|----------------|
| **Web server** | Serves files directly from disk |
| **Reverse proxy** | Forwards client requests to one or more backends |
| **Load balancer** | Spreads traffic across upstream servers |
| **TLS terminator** | Handles certificates and HTTPS at the edge |
| **Edge filter** | Adds headers, rewrites URLs, compresses responses, enforces access rules |

Clients talk to Nginx. Nginx talks to your apps. Your apps usually do **not** need to be exposed directly to the public internet.

---

## Where Nginx Fits in the Architecture

A typical modern layout:

```
                    Internet / users
                            │
                            ▼
              ┌─────────────────────────┐
              │   Nginx (edge / proxy)  │
              │  - TLS termination      │
              │  - routing / locations  │
              │  - load balancing       │
              │  - access / error logs  │
              └───────────┬─────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
     App instance    App instance    App instance
     (Spring Boot)   (Spring Boot)   (Spring Boot)
          │
          ▼
       Database / caches / other services
```

### Request flow (simplified)

1. Client sends `GET /api/orders/1` to `https://example.com`
2. Nginx accepts the connection (often on port 443)
3. A matching `server` + `location` decides what to do
4. For API traffic, Nginx `proxy_pass`es to an `upstream` pool
5. The backend responds; Nginx returns the response to the client
6. Nginx writes access/error logs (useful for ops and telemetry)

### Why put Nginx in front?

- Keep app ports private (only Nginx is public)
- One place for TLS, compression, and common headers
- Scale backends without changing client URLs
- Capture edge latency and status codes separately from app metrics

---

## Main Configuration Files

On a typical Linux install, config lives under `/etc/nginx/`. Layout can vary slightly by distro (Debian/Ubuntu vs RHEL/CentOS), but the ideas are the same.

| File / directory | Role |
|------------------|------|
| `/etc/nginx/nginx.conf` | **Main entry point** — global settings, `events`, `http`, includes |
| `/etc/nginx/conf.d/*.conf` | Extra server/site configs included by `nginx.conf` |
| `/etc/nginx/sites-available/` | (Debian/Ubuntu) site definitions (enabled via symlink) |
| `/etc/nginx/sites-enabled/` | (Debian/Ubuntu) active sites (symlinks into `sites-available`) |
| `/etc/nginx/mime.types` | Maps file extensions to Content-Type |
| `/etc/nginx/proxy_params` or custom `proxy_params.conf` | Shared reverse-proxy headers and timeouts |
| `/var/log/nginx/access.log` | Request log (who called what, status, timing) |
| `/var/log/nginx/error.log` | Errors, warnings, config/runtime problems |
| `/var/run/nginx.pid` | Process ID of the master process |

**Load order (mental model):**

```
nginx.conf
  └── include conf.d/*.conf   (or sites-enabled/*)
        └── each server { ... location { include proxy_params; } }
```

In Docker-based setups, the same files are often copied into the image (for example under `/etc/nginx/`) and mounted or baked at build time.

---

## Main Configuration Explained

Nginx config is hierarchical. Directives live in **contexts** (blocks). Child contexts inherit settings unless overridden.

### 1. Top-level / global

```nginx
worker_processes auto;                 # how many worker processes (usually = CPU cores)
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;
```

| Directive | Meaning |
|-----------|---------|
| `worker_processes` | Number of workers that handle connections |
| `error_log` | Where errors go and at what severity |
| `pid` | File storing the master process PID |

### 2. `events` block

```nginx
events {
    worker_connections 1024;           # max connections per worker
}
```

Controls how connections are accepted and how many each worker can handle.

### 3. `http` block

Most web/proxy settings live here:

```nginx
http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    access_log /var/log/nginx/access.log;
    sendfile on;
    keepalive_timeout 65;

    gzip on;

    upstream backend_app {
        server 127.0.0.1:8080;
    }

    include /etc/nginx/conf.d/*.conf;
}
```

Common `http`-level ideas:

| Concept | Purpose |
|---------|---------|
| `log_format` / `access_log` | Define and enable request logging |
| `gzip` | Compress responses at the edge |
| `upstream` | Named pool of backend servers |
| `include` | Pull in site/server files |

### 4. `upstream` — backend pool

```nginx
upstream backend_app {
    least_conn;                        # optional load-balancing method
    server app1.internal:8080;
    server app2.internal:8080;
    keepalive 32;                      # reuse connections to backends
}
```

Then locations proxy to the **name** of the upstream (`backend_app`), not a hard-coded single host every time.

### 5. `server` — virtual host

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    # locations go here
}
```

| Directive | Meaning |
|-----------|---------|
| `listen` | Port (and optionally `ssl`) |
| `server_name` | Which hostnames this block serves |

One Nginx process can host many `server` blocks (multiple sites / APIs).

### 6. `location` — URL routing

```nginx
server {
    listen 80;
    server_name example.com;

    location /static/ {
        root /var/www;
    }

    location /api/ {
        proxy_pass http://backend_app;
        include /etc/nginx/proxy_params;
    }

    location / {
        root /var/www/html;
        try_files $uri $uri/ =404;
    }
}
```

| Pattern | Typical use |
|---------|-------------|
| `location /static/` | Serve files from disk |
| `location /api/` | Reverse proxy to application |
| `location = /exact` | Exact match only |
| `location /` | Catch-all / default |

**Matching tip:** exact `location =` wins over prefix matches; more specific prefixes beat broader ones.

### 7. Reverse proxy essentials

When proxying, Nginx should forward useful client context:

```nginx
proxy_set_header Host              $host;
proxy_set_header X-Real-IP         $remote_addr;
proxy_set_header X-Forwarded-For  $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

These headers let the backend know the original host, client IP, and whether the client used HTTP or HTTPS.

### Minimal “proxy to an app” example

```nginx
http {
    upstream app {
        server 127.0.0.1:8080;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

---

## How to Install, Start, and Run Nginx

Commands below use common package-manager / systemd patterns. Exact package names can differ by OS.

### Install (examples)

```bash
# Debian / Ubuntu
sudo apt update && sudo apt install nginx

# RHEL / CentOS / Fedora (dnf/yum)
sudo dnf install nginx
```

### Start / stop / restart (systemd)

```bash
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx      # apply config without dropping connections
sudo systemctl enable nginx      # start on boot
sudo systemctl status nginx
```

### Test config before reloading

Always validate after edits:

```bash
sudo nginx -t
```

If the test passes:

```bash
sudo systemctl reload nginx
# or:
sudo nginx -s reload
```

### Useful control signals

```bash
nginx -s stop      # fast shutdown
nginx -s quit      # graceful shutdown
nginx -s reload    # reload config
nginx -s reopen    # reopen log files (log rotation)
```

### Run in Docker (common for demos / labs)

```bash
# Official image, publish port 80
docker run --name nginx -p 80:80 -d nginx

# With a custom config mounted
docker run --name nginx -p 80:80 \
  -v /path/to/nginx.conf:/etc/nginx/nginx.conf:ro \
  -d nginx
```

With Docker Compose, Nginx is often a service next to your app:

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
```

Then:

```bash
docker compose up -d
docker compose exec nginx nginx -t
docker compose exec nginx nginx -s reload
```

### Verify it is listening

```bash
curl -I http://localhost/
# or, if mapped to 8080:
curl -I http://localhost:8080/
```

---

## Day-to-Day Operations Cheat Sheet

| Task | Command / action |
|------|------------------|
| Check config syntax | `nginx -t` |
| Apply config safely | `nginx -t && nginx -s reload` |
| Watch access log | `tail -f /var/log/nginx/access.log` |
| Watch errors | `tail -f /var/log/nginx/error.log` |
| See if process is up | `systemctl status nginx` or `ps aux \| grep nginx` |
| Find which config is used | `nginx -T` (dumps full effective config) |

---

## Architecture Recap

| Layer | Component | Responsibility |
|-------|-----------|----------------|
| Client | Browser / mobile / API client | Sends HTTP(S) |
| Edge | **Nginx** | TLS, routing, LB, static files, edge logs |
| App | Spring Boot / other services | Business logic |
| Data | DB, cache, message bus | Persistence and async work |

**Rule of thumb:** put anything that is shared across apps (TLS, compression, common headers, request IDs, rate limits, public routing) in Nginx; keep domain logic in the application.

---

## Further Reading

- Official docs: [https://nginx.org/en/docs/](https://nginx.org/en/docs/)
- Beginner’s guide: [https://nginx.org/en/docs/beginners_guide.html](https://nginx.org/en/docs/beginners_guide.html)
- Reverse proxy guide: [https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
