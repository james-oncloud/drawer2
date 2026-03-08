import os


def get_env(name: str, default: str) -> str:
    return os.getenv(name, default)


DATABASE_URL = get_env(
    "DATABASE_URL", "postgresql+psycopg2://postgres:postgres@db:5432/app"
)
REDIS_URL = get_env("REDIS_URL", "redis://redis:6379/0")
