from datetime import datetime

from pydantic import BaseModel


class ItemCreate(BaseModel):
    name: str
    notes: str | None = None


class ItemRead(BaseModel):
    id: int
    name: str
    notes: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
