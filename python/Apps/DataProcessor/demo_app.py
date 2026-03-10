from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from app.adapters.input.db_reader import DbReader
from app.adapters.input.json_file_reader import JsonFileReader
from app.adapters.mappers.record_mapper import RecordMapper
from app.adapters.output.invalid_record_writer import InvalidRecordWriter
from app.adapters.output.s3_json_writer import S3JsonWriter
from app.adapters.validators.record_validator import RecordValidator
from app.application.ingestion_service import RecordIngestionService
from app.application.pipeline import ProcessingPipeline
from app.application.step_factory import StepFactory
from app.ports.readers import DbSourceReader, JsonSourceReader, Reader
from app.ports.writers import JsonWriter


class LocalS3Client:
    """Fake S3 client that writes objects to local files."""

    def __init__(self, base_dir: Path):
        self._base_dir = base_dir

    def put_object(self, *, Bucket: str, Key: str, Body: bytes) -> None:
        target = self._base_dir / Bucket / Key
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(Body)


def _demo_db_rows() -> list[dict[str, Any]]:
    now = datetime.now(timezone.utc)
    return [
        {
            "id": "db-1001",
            "source": "db",
            "amount": "15000.00",
            "currency": "usd",
            "timestamp": now.isoformat(),
        },
        {
            "id": "db-1002",
            "source": "db",
            "amount": "-10",
            "currency": "USD",
            "timestamp": now.isoformat(),
        },
    ]


def _write_demo_input(path: Path) -> None:
    now = datetime.now(timezone.utc)
    records = [
        {
            "id": "file-2001",
            "source": "file",
            "amount": "500.55",
            "currency": "eur",
            "timestamp": now.isoformat(),
        },
        {
            "id": "",
            "source": "file",
            "amount": "5.00",
            "currency": "USD",
            "timestamp": now.isoformat(),
        },
        {
            "id": "file-2002",
            "source": "file",
            "amount": "100",
            "currency": "XXX",
            "timestamp": now.isoformat(),
        },
        {
            "id": "file-2003",
            "source": "file",
            "amount": "20",
            "currency": "USD",
            "timestamp": (now - timedelta(days=400)).isoformat(),
        },
    ]
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(json.dumps(row) for row in records) + "\n", encoding="utf-8")


def main() -> None:
    demo_root = Path("./demo")
    input_path = demo_root / "input" / "records.jsonl"
    invalid_path = demo_root / "invalid" / "data.json"
    fake_s3_path = demo_root / "s3_dump"
    _write_demo_input(input_path)

    db_reader: DbSourceReader = DbReader(fetch_rows=_demo_db_rows)
    json_reader: JsonSourceReader = JsonFileReader(file_paths=[input_path])
    readers: list[Reader] = [db_reader, json_reader]
    mapper = RecordMapper()
    validator = RecordValidator(supported_currencies=["USD", "EUR", "GBP", "JPY"])
    invalid_writer = InvalidRecordWriter(output_path=invalid_path)
    pipeline = ProcessingPipeline(
        steps=StepFactory.build_steps(
            ["normalize_currency", "enrich_counterparty", "risk_classification"]
        )
    )
    valid_writer: JsonWriter = S3JsonWriter(
        bucket="demo-bucket",
        prefix="business-records",
        batch_size=2,
        s3_client=LocalS3Client(base_dir=fake_s3_path),
    )
    service = RecordIngestionService(
        readers=readers,
        mapper=mapper,
        validator=validator,
        invalid_writer=invalid_writer,
        pipeline=pipeline,
        valid_writer=valid_writer,
    )
    service.run()

    print("Demo complete.")
    print(f"Input file: {input_path}")
    print(f"Invalid records: {invalid_path}")
    print(f"Simulated S3 output: {fake_s3_path}")


if __name__ == "__main__":
    main()
