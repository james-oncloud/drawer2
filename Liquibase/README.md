# Liquibase Demo

A minimal Spring Boot app with PostgreSQL. Liquibase applies database migrations automatically when the app starts.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with Docker Compose

## Quick start

From the `Liquibase/` directory:

```bash
./shell/fireup.sh
```

Or use Compose directly:

```bash
docker compose up --build -d
```

Wait a few seconds for the app to start, then check:

| What        | URL / connection                                      |
|-------------|-------------------------------------------------------|
| Users API   | http://localhost:8082/users                           |
| Health      | http://localhost:8082/health                          |
| PostgreSQL  | `localhost:5433` — user `demo`, password `demo`, db `liquibase_demo` |

Example:

```bash
curl http://localhost:8082/users
```

## Startup options

All commands assume you are in the `Liquibase/` directory.

```bash
# Build and start in the background (recommended)
docker compose up --build -d

# Build and start in the foreground (logs in this terminal)
docker compose up --build

# Start without rebuilding (after the first build)
docker compose up -d

# Follow app logs
docker compose logs -f app
```

On first startup, Liquibase creates the `users` table and seeds two rows. Migration files live in `app/src/main/resources/db/changelog/`.

## Shutdown

```bash
./shell/shutdown.sh
```

Or with Compose directly:

```bash
# Stop containers (keeps database volume and images)
docker compose down

# Stop and remove the Compose network
docker compose down --remove-orphans
```

To stop **and delete all database data** (fresh start on next `up`):

```bash
docker compose down -v
```

The `-v` flag removes the `postgres_data` volume. Liquibase will re-run all migrations from scratch the next time you start the stack.

## Run locally without Docker (optional)

Start Postgres only:

```bash
docker compose up -d postgres
```

Then from `app/`:

```bash
mvn spring-boot:run
```

The app defaults to `localhost:5433` in `application.properties`.

## Project layout

```
Liquibase/
├── docker-compose.yml
├── shell/fireup.sh
├── app/                          # Spring Boot application
│   └── src/main/resources/db/changelog/   # Liquibase YAML migrations
└── notes.md                      # How Liquibase works
```
