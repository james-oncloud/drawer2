from celery import Celery

from app.core.config import REDIS_URL

celery_app = Celery("worker", broker=REDIS_URL, backend=REDIS_URL)


@celery_app.task
def echo_task(message: str) -> str:
    return f"echo: {message}"
