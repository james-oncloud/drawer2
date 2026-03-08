# Complex-First Python Learning Path

This path starts from real, complicated setups and works backward to
fundamentals. The goal is to learn Python by building and debugging complex
systems first.

## Complex-First Learning Path

- Start with a real production-style app
  - Build a small but complete system: FastAPI backend + Postgres + Redis +
    Docker + background jobs.
  - Goal: read the system end-to-end before you master syntax.

- Follow a “reverse dependency” approach
  - Learn what each piece does only after you’ve wired it.
  - Example: set up ORM models → then learn classes → then learn data types.

- Use failure-driven learning
  - Intentionally break things (bad migrations, failing tests, race conditions).
  - Debugging forces you to learn the language mechanics.

- Work inside a real repo
  - Clone a well-known Python project (FastAPI, Django, Airflow).
  - Trace execution paths, read config, run tests, tweak small features.

- Learn Python via tools, not tutorials
  - Use pytest, ruff, mypy, poetry, pre-commit, CI configs.
  - Read the warnings and errors; learn only what fixes them.

## Suggested 6-Stage Sequence

1. Stage 1 — Full stack app
   - Build: FastAPI + Postgres + Docker + Alembic migrations + background
     worker (Celery/RQ).
   - You’ll write code without fully understanding it.

2. Stage 2 — Add production concerns
   - Logging, retries, caching, config management, environment separation.
   - Learn modules like logging, os, pathlib, typing.

3. Stage 3 — Observability + CI
   - Add tests, linting, formatting, GitHub Actions.
   - Learn pytest, fixtures, mocks, type hints.

4. Stage 4 — Read real codebases
   - Follow one request through FastAPI or Django source.
   - Learn decorators, async, dependency injection, metaclasses (when needed).

5. Stage 5 — Performance + concurrency
   - Add async tasks, multiprocessing, profiling.
   - Learn asyncio, GIL implications, context managers.

6. Stage 6 — Backfill the basics
   - Learn syntax and fundamentals only to explain what you already touched.

## Common and popular Python libraries

- Web frameworks: FastAPI, Django, Flask
- Data and numerical: pandas, numpy, scipy
- Machine learning: scikit-learn, xgboost, lightgbm
- Deep learning: pytorch, tensorflow, keras
- APIs and HTTP: requests, httpx
- Databases/ORMs: SQLAlchemy, psycopg2-binary, asyncpg
- Task queues: celery, rq
- Caching/queues: redis, kombu
- Testing: pytest, hypothesis
- Lint/format/type: ruff, black, isort, mypy
- CLI: typer, click
- Workflow/orchestration: airflow, prefect
- Web scraping: beautifulsoup4, scrapy
- Async: asyncio, trio, anyio
- Visualization: matplotlib, seaborn, plotly

If you want, I can propose a specific project setup and build checklist, or
recommend a codebase to clone and trace based on your interests.
