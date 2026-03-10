from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

from app.domain.models import BusinessRecord


class RecordMapper(ABC):
    @abstractmethod
    def map(self, raw: dict[str, Any]) -> BusinessRecord:
        """Map a raw record into the internal domain model."""
