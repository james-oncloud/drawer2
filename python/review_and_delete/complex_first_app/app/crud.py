from sqlalchemy.orm import Session

from app import models, schemas


def create_item(db: Session, item_in: schemas.ItemCreate) -> models.Item:
    item = models.Item(name=item_in.name, notes=item_in.notes)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def list_items(db: Session, limit: int = 100) -> list[models.Item]:
    return db.query(models.Item).order_by(models.Item.id.desc()).limit(limit).all()
