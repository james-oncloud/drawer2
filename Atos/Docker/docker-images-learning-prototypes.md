# Docker Images for Learning and Quick Prototypes

Common image types you’ll reach for when exploring Docker, trying tools, or spinning up short-lived demos.

## Base / OS images

Minimal operating systems used as a starting point for custom images or shell experiments.

| Image | Typical use |
| --- | --- |
| `alpine` | Tiny Linux base; great for learning layers and keeping images small |
| `ubuntu` / `debian` | Familiar package managers (`apt`); good for general Linux practice |
| `busybox` | Extremely small; useful for understanding what “minimal” means |

## Language / runtime images

Official images that already include a language runtime—ideal for throwaway apps and tutorials.

| Image | Typical use |
| --- | --- |
| `python` | Scripts, Flask/FastAPI prototypes, data notebooks |
| `node` | Quick Node/Express or front-end tooling demos |
| `golang` | Compile or run small Go services |
| `openjdk` / `eclipse-temurin` | Java/Spring prototypes |
| `ruby` | Rails or Sinatra experiments |
| `php` | Simple PHP apps or WordPress-adjacent tests |
| `dotnet/sdk` / `dotnet/aspnet` | .NET learning and API demos |

## Web servers and reverse proxies

Serve static content or put a proxy in front of an app without configuring a full host.

| Image | Typical use |
| --- | --- |
| `nginx` | Static sites, reverse proxy, SSL termination practice |
| `httpd` (Apache) | Classic web-server labs |
| `caddy` | Automatic HTTPS and simple reverse-proxy configs |
| `traefik` | Dynamic routing and Docker-aware reverse proxy demos |

## Databases and caches

Stateful services for local apps—usually throwaway volumes for prototypes.

| Image | Typical use |
| --- | --- |
| `postgres` | Relational DB for APIs and ORMs |
| `mysql` / `mariadb` | MySQL-compatible stacks |
| `mongo` | Document DB prototypes |
| `redis` | Cache, sessions, queues |
| `sqlite`-via-app | Often embedded in the app image rather than a separate container |

## Message queues and streaming

| Image | Typical use |
| --- | --- |
| `rabbitmq` | Work queues and pub/sub demos |
| `bitnami/kafka` / Apache Kafka images | Event-streaming prototypes |
| `nats` | Lightweight messaging experiments |

## Development and tooling images

Ready-made environments for editors, CI-like tasks, or interactive learning.

| Image | Typical use |
| --- | --- |
| `docker` (Docker-in-Docker) | Nested Docker labs and CI simulation |
| `hashicorp/terraform` | Infra-as-code dry runs |
| `curlimages/curl` | One-off HTTP checks against other containers |
| `adminer` / `phpmyadmin` | Browser UIs for databases |

## Official “hello world” and teaching images

| Image | Typical use |
| --- | --- |
| `hello-world` | Verify Docker install and understand pull/run basics |
| `dockersamples/*` | Official sample apps and multi-service demos |

## Tips for learning and prototypes

- Prefer **official** or well-known images (`library/*`, Docker Hub Verified) for first steps.
- Pin a **tag** (e.g. `python:3.12-slim`) so experiments stay reproducible.
- Use **slim** / **alpine** variants when you care about image size and faster pulls.
- Treat prototype data as disposable: named volumes are fine; don’t store secrets in images.
- Compose several of the above with **Docker Compose** for multi-service prototypes (app + DB + proxy).
