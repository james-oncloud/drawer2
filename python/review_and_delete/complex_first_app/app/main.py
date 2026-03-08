from pathlib import Path

from fastapi import Depends, FastAPI
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import Response
from redis import Redis
from sqlalchemy import text
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.core.config import REDIS_URL
from app.db import Base, engine, get_db
from app.tasks import echo_task

app = FastAPI(title="Complex-First Python App")
SWAGGER_PATH = Path(__file__).resolve().parents[1] / "swagger.yaml"


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health_check(db: Session = Depends(get_db)) -> dict[str, object]:
    db_status = {"ok": False}
    try:
        db.execute(text("SELECT 1"))
        db_status["ok"] = True
    except Exception as exc:
        db_status["error"] = str(exc)

    redis_status = {"ok": False}
    try:
        redis_client = Redis.from_url(REDIS_URL)
        redis_client.ping()
        redis_status["ok"] = True
    except Exception as exc:
        redis_status["error"] = str(exc)

    overall = "ok" if db_status["ok"] and redis_status["ok"] else "degraded"
    return {"status": overall, "db": db_status, "redis": redis_status}


@app.post("/items", response_model=schemas.ItemRead)
def create_item(
    item: schemas.ItemCreate, db: Session = Depends(get_db)
) -> schemas.ItemRead:
    created = crud.create_item(db, item)
    echo_task.delay(f"created item {created.id}")
    return created


@app.get("/items", response_model=list[schemas.ItemRead])
def list_items(db: Session = Depends(get_db)) -> list[schemas.ItemRead]:
    return crud.list_items(db)


@app.get("/swagger.yaml", include_in_schema=False)
def swagger_yaml() -> Response:
    return Response(
        SWAGGER_PATH.read_text(encoding="utf-8"),
        media_type="application/yaml",
    )


@app.get("/swagger", include_in_schema=False)
def swagger_ui() -> Response:
    return get_swagger_ui_html(
        openapi_url="/swagger.yaml",
        title="Complex-First Python App - Swagger",
    )
