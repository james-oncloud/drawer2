from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Iterable


class Reader(ABC):
    @abstractmethod
    def read(self) -> Iterable[dict[str, Any]]:
        """Read raw records from a source."""


class DbSourceReader(Reader, ABC):
    """Port for readers that ingest from database-like sources."""


class JsonSourceReader(Reader, ABC):
    """Port for readers that ingest JSON/JSONL files."""
