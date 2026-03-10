from __future__ import annotations

from collections.abc import Callable, Iterable
from typing import Any

from app.ports.readers import DbSourceReader


class DbReader(DbSourceReader):
    """Adapter over an injected DB fetch function/repository."""

    def __init__(self, fetch_rows: Callable[[], Iterable[dict[str, Any]]]):
        self._fetch_rows = fetch_rows

    def read(self) -> Iterable[dict[str, Any]]:
        yield from self._fetch_rows()
