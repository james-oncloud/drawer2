from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

from app.domain.models import BusinessRecord
from app.domain.validation import ValidationError


class Writer(ABC):
    @abstractmethod
    def write(self, record: BusinessRecord) -> None:
        """Write a valid record to a sink."""

    def flush(self) -> None:
        """Flush buffered data if writer supports batching."""


class JsonWriter(Writer, ABC):
    """Port for writers that serialize output as JSON/JSONL."""


class InvalidRecordSink(ABC):
    @abstractmethod
    def write(
        self,
        *,
        source: str,
        raw_record: dict[str, Any],
        errors: list[ValidationError],
    ) -> None:
        """Persist invalid records with structured context."""

    def flush(self) -> None:
        """Flush buffered invalid output."""
