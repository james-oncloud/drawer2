from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Iterable

from app.ports.readers import JsonSourceReader


class JsonFileReader(JsonSourceReader):
    """Reads either JSON array files or JSONL files."""

    def __init__(self, file_paths: list[Path]):
        self._file_paths = file_paths

    def read(self) -> Iterable[dict[str, Any]]:
        for path in self._file_paths:
            content = path.read_text(encoding="utf-8").strip()
            if not content:
                continue

            if content.startswith("["):
                records = json.loads(content)
                for record in records:
                    if isinstance(record, dict):
                        yield record
            else:
                for line in content.splitlines():
                    line = line.strip()
                    if not line:
                        continue
                    record = json.loads(line)
                    if isinstance(record, dict):
                        yield record
