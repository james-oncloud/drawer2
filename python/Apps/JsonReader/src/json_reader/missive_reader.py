from __future__ import annotations

from collections.abc import Generator
from pathlib import Path

from .models import Message
from .streaming import iter_json_array


class MissiveReader:
    """Adapter that converts raw JSON records into domain messages."""

    def __init__(self, json_path: Path) -> None:
        self._json_path = json_path

    def iter_messages(self) -> Generator[Message, None, None]:
        for raw_item in iter_json_array(self._json_path):
            if not isinstance(raw_item, dict):
                continue
            yield Message.from_dict(raw_item)

