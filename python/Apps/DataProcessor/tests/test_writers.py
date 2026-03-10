from __future__ import annotations

import json
import tempfile
import unittest
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Any

from app.adapters.output.invalid_record_writer import InvalidRecordWriter
from app.adapters.output.s3_json_writer import S3JsonWriter
from app.domain.models import BusinessRecord
from app.domain.validation import ValidationError


class FakeS3Client:
    def __init__(self):
        self.calls: list[dict[str, Any]] = []

    def put_object(self, *, Bucket: str, Key: str, Body: bytes) -> None:
        self.calls.append({"Bucket": Bucket, "Key": Key, "Body": Body})


class TestWriters(unittest.TestCase):
    def test_invalid_record_writer_writes_jsonl(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            output_path = Path(tmp) / "invalid" / "data.json"
            writer = InvalidRecordWriter(output_path=output_path)
            writer.write(
                source="JsonFileReader",
                raw_record={"id": None},
                errors=[ValidationError(field="id", message="Must not be empty")],
            )
            writer.flush()
            writer.close()

            lines = output_path.read_text(encoding="utf-8").strip().splitlines()
            self.assertEqual(len(lines), 1)
            payload = json.loads(lines[0])
            self.assertEqual(payload["source"], "JsonFileReader")
            self.assertEqual(payload["errors"][0]["field"], "id")

    def test_s3_writer_batches_records(self) -> None:
        client = FakeS3Client()
        writer = S3JsonWriter(
            bucket="demo-bucket",
            prefix="records",
            batch_size=2,
            s3_client=client,
        )
        record = BusinessRecord(
            record_id="1",
            source="file",
            amount=Decimal("12.34"),
            currency="USD",
            timestamp=datetime.now(timezone.utc),
        )
        writer.write(record)
        writer.write(record)
        writer.flush()

        self.assertEqual(len(client.calls), 1)
        call = client.calls[0]
        self.assertEqual(call["Bucket"], "demo-bucket")
        self.assertIn("records/date=", call["Key"])
        self.assertIn("source=file", call["Key"])


if __name__ == "__main__":
    unittest.main()
