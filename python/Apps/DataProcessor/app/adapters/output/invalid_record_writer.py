from __future__ import annotations

import json
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.domain.validation import ValidationError
from app.ports.writers import InvalidRecordSink


class InvalidRecordWriter(InvalidRecordSink):
    """
    Writes one JSON object per line to ./invalid/data.json by default.
    The file extension remains .json to match contract, while content is JSONL.
    """

    def __init__(self, output_path: Path):
        self._output_path = output_path
        self._output_path.parent.mkdir(parents=True, exist_ok=True)
        self._fh = output_path.open("a", encoding="utf-8")

    def write(
        self,
        *,
        source: str,
        raw_record: dict[str, Any],
        errors: list[ValidationError],
    ) -> None:
        payload = {
            "source": source,
            "ingestion_time": datetime.now(timezone.utc).isoformat(),
            "raw_record": raw_record,
            "errors": [asdict(error) for error in errors],
        }
        self._fh.write(json.dumps(payload, default=str) + "\n")

    def flush(self) -> None:
        self._fh.flush()

    def close(self) -> None:
        if not self._fh.closed:
            self._fh.close()

    def __del__(self) -> None:
        self.close()
