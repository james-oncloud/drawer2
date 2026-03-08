# Complex-First Python App (Docker)

This is a production-style starter app to learn Python from a complex setup.
It includes:

- FastAPI web API
- Postgres database
- Redis broker
- Celery background worker
- Docker Compose orchestration

## What the app does

This app is a tiny inventory-style service. You can create and list items via a
REST API. Each item is stored in Postgres, and a background Celery task runs
whenever a new item is created. A `/health` endpoint reports connectivity to
Postgres and Redis so you can verify service wiring.

## How the app works (high level)

1. `docker compose up` starts four services: API, worker, Postgres, Redis.
2. The API starts, creates tables, and listens on port 8000.
3. A POST to `/items` writes to Postgres and enqueues a background task.
4. The worker consumes tasks from Redis and executes them.
5. The `/health` endpoint checks Postgres and Redis connectivity.

## Quick start

1. Build and run:

   docker compose up --build

2. Open API docs:

   http://localhost:8000/docs

3. Create an item:

   POST http://localhost:8000/items
   {"name": "Learn Python", "notes": "complex-first"}

4. List items:

   GET http://localhost:8000/items

Note: the Postgres container maps to host port 5433 to avoid conflicts with any
local Postgres running on 5432.

Swagger file and UI:
- `http://localhost:8000/swagger.yaml`
- `http://localhost:8000/swagger`

## Project structure and purpose

- `docker-compose.yml` defines all services (API, worker, Postgres, Redis).
- `Dockerfile` builds the Python image used by the API and worker.
- `requirements.txt` pins the Python dependencies.
- `app/` is the application package:
  - `app/main.py` is the FastAPI entrypoint. It creates tables at startup,
    exposes `/health`, `/items`, and triggers a background task on create.
  - `app/db.py` creates the SQLAlchemy engine/session and the `get_db`
    dependency used by FastAPI.
  - `app/models.py` defines the `Item` ORM model and its table schema.
  - `app/schemas.py` defines Pydantic request/response models for the API.
  - `app/crud.py` holds database operations like create/list items.
  - `app/tasks.py` defines the Celery app and a demo background task.
  - `app/core/config.py` loads environment-based settings such as DB/Redis URLs.
  - `app/__init__.py` and `app/core/__init__.py` mark packages.

## Dependency purposes

- `fastapi` provides the web framework and request/response handling.
- `uvicorn[standard]` runs the ASGI server that serves the FastAPI app.
- `SQLAlchemy` is the ORM and SQL toolkit for Postgres access.
- `psycopg2-binary` is the Postgres driver used by SQLAlchemy.
- `celery` runs background tasks and manages the worker process.
- `redis` is the Redis client used by Celery and health checks.
- `pydantic` validates request payloads and shapes response data.

## What to explore first

- `app/main.py` to see the API entrypoint
- `app/models.py` for ORM models
- `app/tasks.py` for background jobs
- `docker-compose.yml` to understand services

## Next steps

- Add Alembic migrations
- Add tests with pytest
- Add caching and retries
- Add structured logging
